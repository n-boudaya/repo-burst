package main;

import java.io.*;
import java.nio.file.*;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import fileTypes.HierarchyAndDepends;
import fileTypes.data_element;
import org.json.JSONArray;
import org.json.JSONObject;

import processors.javascript_processor;
import processors.processor;

/**
 * main.FileReader
 */
public class FileReader {

    static Path indexPath = Paths.get("./data/index.json");
    static Path backupLocation = Paths.get("./data/backup/");

    ArrayList<processor> processors;
    ArrayList<String> accessibleFiletypes;

    //directory is the location of the commits that should be scanned. separator folder is the folder that is inserted behind the numbered commits,
    //to easily remove any deanonymizing parts from saved paths.
    public FileReader(Path directory, String separatorFolder) {

        processors = new ArrayList<>();

        processors.add(new javascript_processor());

        accessibleFiletypes = new ArrayList<>();

        for (processor p : processors) {
            accessibleFiletypes.addAll(p.getFileTypes());
        }

        String currTime = ZonedDateTime.now().format(DateTimeFormatter.ofPattern("uuuu-MM-dd-HH-mm-ss"));

        Path outputLocation = Paths.get( "./data/file_lists/"+ currTime +"/");
        Path dependencyLocation = Paths.get(outputLocation.toString(),"/dependencies/");
        Path hierarchyLocation = Paths.get(outputLocation.toString(),"/hierarchy/");

        Path backupPath = backupLocation.resolve("backup"+currTime+"index.json");

        System.out.println(backupPath.toAbsolutePath());

        //creates the output folders if they don't already exist
        try {
            Files.createDirectories(outputLocation);
            Files.createDirectories(dependencyLocation);
            Files.createDirectories(hierarchyLocation);
        } catch (IOException e) {            
            e.printStackTrace();
        }

        //Scans and processes each folder in the given path
        try (DirectoryStream<Path> directoryContentStream = Files.newDirectoryStream(directory)) {
            for (Path directoryElement : directoryContentStream) {
                                    System.out.println(directoryElement.getFileName());
                               outputFiles(directoryElement, dependencyLocation, hierarchyLocation, separatorFolder);
//                System.out.println(directoryElement.getFileName().toString());
            }
        } catch (Exception e) {
            System.err.println("Top Level Directory Access: " + e.getMessage());
        }

        createIndexFile(dependencyLocation, hierarchyLocation, indexPath, backupPath);
    }

    //when called from cmd, the user should firstly supply the folder containing the commits that should be scanned, and the separator string.
    //Explanations for that can be found in the manual about dataset preparation.
    public static void main(String[] args) {

        //default values
        Path directory = Paths.get("./data/raw_data");
        String separatorFolder = "separator";

        if(args.length == 2) {
            try{
                directory = Paths.get(args[0]);
                separatorFolder = args[1];

                FileReader fR = new FileReader(directory,separatorFolder);
            }
            catch (Exception e){
                e.printStackTrace();

                System.out.println(e.getMessage());
            }
        }
        else if(args.length == 0){
            FileReader fR = new FileReader(directory,separatorFolder);
        }
        else{
            throw new IllegalArgumentException("Wrong number of arguments");
        }
    }

    //Creates the index file that contains paths to all hierarchy and dependency files for the current dataset
    public void createIndexFile(Path dependencyLocation, Path hierarchyLocation, Path indexPath, Path backupPath){

        try {
            if (Files.isRegularFile(indexPath)) {
                Files.deleteIfExists(indexPath);
            }
        } catch (IOException e) {
            System.err.println("Error occurred when deleting index.json:" + e.getMessage());
            return;
        }

        ArrayList<String> dependencyFiles = new ArrayList<>();
        ArrayList<String> hierarchyFiles = new ArrayList<>();

        try (DirectoryStream<Path> dependStream = Files.newDirectoryStream(dependencyLocation); DirectoryStream<Path> hierarchyStream = Files.newDirectoryStream(hierarchyLocation);) {
            for (Path directoryElement : dependStream) {
                dependencyFiles.add(directoryElement.toString());
            }
            Collections.sort(dependencyFiles);

            for (Path directoryElement : hierarchyStream) {
                hierarchyFiles.add(directoryElement.toString());
            }
            Collections.sort(hierarchyFiles);
        } catch (Exception e) {
            System.err.println("Fetch dependency and hierarchy files: " + e.getMessage());
        }

        JSONArray indexFiles = new JSONArray();

        for(int i = 0; i < dependencyFiles.size(); i++){
            JSONObject indexEntry = new JSONObject();

            indexEntry.put("dependency", dependencyFiles.get(i));
            indexEntry.put("hierarchy", hierarchyFiles.get(i));

            indexFiles.put(indexEntry);
        }

        try (BufferedWriter br = new BufferedWriter(new FileWriter(indexPath.toFile(), true))) {
            br.write(indexFiles.toString());
        } catch (Exception e) {
            System.err.println("indexFile Writer: " + e.getMessage());
        }

        try (BufferedWriter br = new BufferedWriter(new FileWriter(backupPath.toFile(), true))) {
            br.write(indexFiles.toString());
        } catch (Exception e) {
            System.err.println("Backup indexFile Writer: " + e.getMessage());
        }
    }

    //Gets a path to process (directory), the location the dependency and hierarchy files should be written to (dependencyLocation,hierarchyLocation)
    //and the unique separator separating the raw data folder names from their contents.
    //Processes all the files contained in directory, extracting the file structure and dependencies and writing JSON files containing those
    //in a machine-readable format to the given directories
   public void outputFiles(Path directory, Path dependencyLocation, Path hierarchyLocation, String separatorFolder) {

        //Due to conversions between JSON files and java strings, which both handle escaping backslashes differently,
       //the backslashes in the file path have to be excaped 16 times.
        String regex = "";
       try {
           System.out.println(directory.toRealPath(LinkOption.NOFOLLOW_LINKS));

           String temp = "\"" + directory.toRealPath(LinkOption.NOFOLLOW_LINKS).toString();

           regex = temp.replaceAll("\\\\","\\\\\\\\\\\\\\\\");

           System.out.println(regex);
       } catch (IOException e) {
           throw new RuntimeException(e);
       }

       //Processes the data
       HierarchyAndDepends outputs = fileTreeToJSON(Paths.get(directory.toString(), separatorFolder),
               new HierarchyAndDepends(new JSONObject(), new JSONArray(), null, null, null) , 0);

       //Adds incoming dependencies and adjusts outgoing dependencies of directories to not go down the hierarchy
        addIncomingDependencies(outputs.getDependencies());


        //Writes the results to two separate files.
       File hierarchyFile = new File(hierarchyLocation.toString() + "\\" + directory.getFileName() + ".json");

       try (BufferedWriter br = new BufferedWriter(new FileWriter(hierarchyFile, true))) {
           br.write(postProcessDepends(outputs.getHierarchy().toString(),regex));
       } catch (Exception e) {
           System.err.println("Hierarchy Writer: " + e.getMessage());
       }

       File dependenciesFile = new File(dependencyLocation.toString() + "\\" + directory.getFileName() + ".json");

       try (BufferedWriter br = new BufferedWriter(new FileWriter(dependenciesFile, true))) {
           br.write(postProcessDepends(outputs.getDependencies().toString(),regex));
       } catch (Exception e) {
           System.err.println("Depends Writer: " + e.getMessage());
       }
   }

   //Writes the structure of all children of currentPath to a HierarchyAndDepends file, scans all compatible code files for dependencies and also adds those.
    //currentLevel is used to keep track of the hierarchy depth relative to the root of the data instead of the root of this program.
    private HierarchyAndDepends fileTreeToJSON(Path currentPath, HierarchyAndDepends lastHierarchyAndDepends, int currentLevel) {
        JSONObject hierarchy = new JSONObject();
        JSONArray dependencies = lastHierarchyAndDepends.getDependencies();
        JSONObject dependenciesEntry = new JSONObject();
        JSONArray outgoingArray = new JSONArray();
        Set<Path> incoming;
        Map<Path, Integer> outgoing;
        Set<Path> externals;


        if(lastHierarchyAndDepends.getIncoming()==null){
            incoming = new HashSet<Path>();
        }
        else {
            incoming = lastHierarchyAndDepends.getIncoming();
        }

        if(lastHierarchyAndDepends.getOutgoing()==null){
            outgoing = new HashMap<Path, Integer>();
        }
        else {
            outgoing = lastHierarchyAndDepends.getOutgoing();
        }

        if(lastHierarchyAndDepends.getExternal()==null){
            externals = new HashSet<Path>();
        }
        else {
            externals = lastHierarchyAndDepends.getExternal();
        }

        boolean isDirectory;

        if (Files.isDirectory(currentPath, LinkOption.NOFOLLOW_LINKS)) {
            // System.out.println("Is Directory:" + currentPath.toString());

            // Stores all the child elements of this directory
            JSONArray directoryContentArray = new JSONArray();

            // Tries opening this directory and recursively running this method on each of
            // its elements
            try (DirectoryStream<Path> directoryContentStream = Files.newDirectoryStream(currentPath)) {
                for (Path directoryElement : directoryContentStream) {//                    System.out.println(directoryElement.getFileName());

                    HierarchyAndDepends childOutputs = fileTreeToJSON(directoryElement, lastHierarchyAndDepends, currentLevel + 1);

                    directoryContentArray.put(childOutputs.getHierarchy());

                    mapAdder(outgoing, childOutputs.getOutgoing());
                }
            } catch (Exception e) {
                System.err.println("Directory Access: " + e.getMessage() + " Current path: " + currentPath.toString());
            }

            isDirectory = true;

            for(Map.Entry<Path, Integer> entry : outgoing.entrySet()) {
                JSONObject outgoingJSONEntry = new JSONObject();
                outgoingJSONEntry.put("path", entry.getKey().toString());
                outgoingJSONEntry.put("value", entry.getValue());

                outgoingArray.put(outgoingJSONEntry);
            }

            try {
                dependenciesEntry.put("path", currentPath.toRealPath(LinkOption.NOFOLLOW_LINKS));
                dependenciesEntry.put("isDirectory", isDirectory);
                dependenciesEntry.put("dirLevel", currentLevel);
                dependenciesEntry.put("value", 1);
                dependenciesEntry.put("outgoing", outgoingArray);
                dependencies.put(dependenciesEntry);
            } catch (IOException e) {
                System.err.println("Path Access Depends: " + e.getMessage());
            }

            hierarchy.put("imports", outgoing);
            hierarchy.put("children", directoryContentArray);
        } else {
            // System.out.println("Is File:" + currentPath.toString());
            isDirectory = false;
            int dotIndex = currentPath.toString().lastIndexOf(".");

            ArrayList<data_element> imports = new ArrayList<data_element>();
            String extension = "";

            JSONArray externalArray = new JSONArray();

            // If the filetype of the current file is supported, its imports get processed
            // and added to the list of imports and dependencies
            if (dotIndex > 0) {
                extension = currentPath.toString().substring(dotIndex + 1);

                // System.out.println("Manual extension found:" + extension);
                // System.out.println("probeContentType:" + Files.probeContentType(p));
                if (accessibleFiletypes.contains(extension)) {
                    for (processor fP : processors) {
                        for (String type : fP.getFileTypes()) {
                            if (type.equals(extension)) {
                                imports = fP.getImports(currentPath);
                            }
                        }
                    }
                    if (!imports.isEmpty()) {
                        for (data_element d : imports) {
                            Path referencedFile = d.getReferencedFile();
                            boolean external = d.isExternal();

                            if(external){
                                externalArray.put(referencedFile);

                                externals.add(referencedFile);
                            }
                            else {
                                outgoingArray.put(referencedFile);

                                outgoing.put(referencedFile, 1);
                            }
                        }
                    }

                    try {
                        dependenciesEntry.put("path", currentPath.toRealPath(LinkOption.NOFOLLOW_LINKS));
                        dependenciesEntry.put("isDirectory", isDirectory);
                        dependenciesEntry.put("dirLevel", currentLevel);
                        dependenciesEntry.put("value", 1);
                        dependenciesEntry.put("outgoing", outgoingArray);
                        dependenciesEntry.put("external", externalArray);
                        dependencies.put(dependenciesEntry);
                    } catch (IOException e) {
                        System.err.println("Path Access Depends: " + e.getMessage());
                    }
                }
            }

            hierarchy.put("extension", extension);
            hierarchy.put("imports", imports);

            try {
                hierarchy.put("value", Files.size(currentPath));
            } catch (IOException e) {
                hierarchy.put("value", -1);
                System.err.println("Filesize Access: " + e.getMessage());
            }
        }

        hierarchy.put("dirLevel", currentLevel);
        hierarchy.put("name", currentPath.getFileName());
        hierarchy.put("isDirectory", isDirectory);

        try {
            hierarchy.put("path", currentPath.toRealPath(LinkOption.NOFOLLOW_LINKS));
        } catch (IOException e) {
            System.err.println("Path Access Hierarchy: " + e.getMessage());
        }
        return new HierarchyAndDepends(hierarchy, dependencies, incoming, outgoing, externals);
    }

    //Iterates over all entries in dependencies, which currently only contains outgoing dependencies
    //Adds incoming dependencies to the targets of the outgoing dependencies
    //Also creates new dependency entries for directories, which contain all incoming and outgoing dependencies of their children
    //Also formats outgoing dependencies from directories as such that they only reference directories at their same depth or lower
   private JSONArray addIncomingDependencies(JSONArray dependencies) {

        //Iterate over all entries of dependencies
       for(Object currEditedObject : dependencies){
           JSONObject currEditedElement = (JSONObject) currEditedObject;
           int endIndex = Paths.get(currEditedElement.get("path").toString()).getNameCount();

           //If this is a file, scan all outgoing dependencies for any that point to this file
           //Add all those to the incoming dependencies for this file
           if(!currEditedElement.getBoolean("isDirectory")){
               JSONArray incoming  = new JSONArray();

               for(Object currViewingObject : dependencies){
                   JSONObject currViewingElement = (JSONObject) currViewingObject;
                   JSONArray currViewingOutgoings = currViewingElement.getJSONArray("outgoing");

                   for (Object outgoingObject : currViewingOutgoings) {
                       String currOutgoingPath = outgoingObject.toString();

                       //System.out.println(currOutgoingPath);
                       if(currOutgoingPath.equals(currEditedElement.get("path").toString())){
                           incoming.put(currViewingElement.get("path").toString());
                       }
                   }
               }

               currEditedElement.put("incoming", incoming);
           }
           //If this is a folder....
           else {
               HashMap<Path, Integer> newOutgoing = new HashMap<Path, Integer>();

               //Add all outgoing
               for(Object currentOutObject : currEditedElement.getJSONArray("outgoing")){

                   Map.Entry<Path, Integer> currEntry = new AbstractMap.SimpleEntry<Path, Integer>(Paths.get(((JSONObject)currentOutObject).get("path").toString()), (Integer)((JSONObject)currentOutObject).get("value"));

                    //If currEntry has a higher depth than the current directory
                   if(currEntry.getKey().getNameCount()>endIndex){
                       //Finds the parent of currEntry with the same depth as the current directory
                       Path newPath = Paths.get(currEntry.getKey().getRoot().toString(),currEntry.getKey().subpath(0, endIndex).toString());

                       //Either adds a new entry into outgoings, or adds the value of currEntry to the value of its parent that was found above
                       if(newOutgoing.containsKey(newPath)) {
                           newOutgoing.replace(newPath, newOutgoing.get(newPath) + currEntry.getValue());
                       }
                       else{
                           newOutgoing.put(newPath, currEntry.getValue());
                       }
                   }
                   else{
                       newOutgoing.put(currEntry.getKey(), currEntry.getValue());
                   }
               }
               currEditedElement.remove("outgoing");

               JSONArray newOutgoingJSON = new JSONArray();

               for(Map.Entry<Path, Integer> entry : newOutgoing.entrySet()) {
                   JSONObject outgoingJSONEntry = new JSONObject();
                   outgoingJSONEntry.put("path", entry.getKey().toString());
                   outgoingJSONEntry.put("value", entry.getValue());

                   newOutgoingJSON.put(outgoingJSONEntry);
               }

               currEditedElement.put("outgoing", newOutgoingJSON);
           }
       }

       return dependencies;
   }

   //Adds newMaps contents to oldMap by either putting newMap entries into oldMap,
   // or adding the value of newMap entries to oldMap entries with the same key
   private void mapAdder(Map<Path, Integer> oldMap, Map<Path, Integer> newMap) {
       for(Map.Entry<Path, Integer> entry : newMap.entrySet()) {
           if(oldMap.containsKey(entry.getKey())) {
               oldMap.replace(entry.getKey(), oldMap.get(entry.getKey()) + entry.getValue());
           }
           else{
               oldMap.put(entry.getKey(), entry.getValue());
           }
       }
   }

   //Used to properly escape backslashes in file paths
    private String postProcessDepends(String input, String regex) {

        String output = input.replaceAll(regex,"\"");

        return output;
    }
}