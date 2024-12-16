package data_and_processing;

import java.io.*;
import java.nio.file.*;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import org.json.JSONArray;
import org.json.JSONObject;

import data_and_processing.processors.javascript_processor;
import data_and_processing.processors.processor;

/**
 * FileReader
 */
public class FileReader {

    Path searchDirectory;
    ArrayList<processor> processors;
    ArrayList<String> accessibleFiletypes;

    int pathCutoff = 4;

    public FileReader(Path directory) {

        searchDirectory = directory;

        processors = new ArrayList<>();

        processors.add(new javascript_processor());

        accessibleFiletypes = new ArrayList<>();

        for (processor p : processors) {
            accessibleFiletypes.addAll(p.getFileTypes());
        }

        String currTime = ZonedDateTime.now().format(DateTimeFormatter.ofPattern("uuuu-MM-dd-HH-mm-ss"));
        

        Path outputLocation = Paths.get( "./data_and_processing/file_lists/"+ currTime +"/");

        try {
            Files.createDirectories(outputLocation);
            Files.createDirectories(Paths.get(outputLocation.toString(),"/hierarchy/"));
            Files.createDirectories(Paths.get(outputLocation.toString(),"/dependencies/"));
        } catch (IOException e) {            
            e.printStackTrace();
        }

        try (DirectoryStream<Path> directoryContentStream = Files.newDirectoryStream(directory)) {
            for (Path directoryElement : directoryContentStream) {
                                    System.out.println(directoryElement.getFileName());
                               outputFiles(directoryElement, outputLocation.toString());
//                System.out.println(directoryElement.getFileName().toString());
            }
        } catch (Exception e) {
            System.err.println("Top Level Directory Access: " + e.getMessage());
        }
    }

    public static void main(String[] args) {
        FileReader fR = new FileReader(Paths.get("./data_and_processing/raw_data/"));
    }

   public void outputFiles(Path directory, String outputDirectory) {

        String regex = "";
       try {
           System.out.println(directory.toRealPath());

           String temp = "\"" + directory.toRealPath().toString();

           regex = temp.replaceAll("\\\\","\\\\\\\\\\\\\\\\");

           System.out.println(regex);
       } catch (IOException e) {
           throw new RuntimeException(e);
       }

       HierarchyAndDepends outputs = fileTreeToJSON(Paths.get(directory.toString(), "svelte"),
               new HierarchyAndDepends(new JSONObject(), new JSONArray(), null, null, null) , 0);

//        addIncomingDependencies(outputs.getDependencies());

       File hierarchyFile = new File(outputDirectory + "/hierarchy/" + directory.getFileName() + ".json");

       try (BufferedWriter br = new BufferedWriter(new FileWriter(hierarchyFile, true))) {
           br.write(postProcessDepends(outputs.getHierarchy().toString(),regex));
       } catch (Exception e) {
           System.err.println("Hierarchy Writer: " + e.getMessage());
       }

       File dependenciesFile = new File(outputDirectory + "/dependencies/" + directory.getFileName() + ".json");

       try (BufferedWriter br = new BufferedWriter(new FileWriter(dependenciesFile, true))) {
           br.write(postProcessDepends(outputs.getDependencies().toString(),regex));
       } catch (Exception e) {
           System.err.println("Depends Writer: " + e.getMessage());
       }
   }

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


//                    incoming.addAll(childOutputs.getIncoming());

                    mapAdder(outgoing, childOutputs.getOutgoing());
//                    collapseMap(outgoing, currentPath);


//                    externals.addAll(childOutputs.getExternal());
//                    System.out.println(outgoing);
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
                dependenciesEntry.put("path", currentPath.toRealPath());
                dependenciesEntry.put("isDirectory", isDirectory);
                dependenciesEntry.put("dirLevel", currentLevel);
                dependenciesEntry.put("value", 1);
                dependenciesEntry.put("outgoing", outgoingArray);
//                dependenciesEntry.put("external", externalArray);
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

//                                if(outgoing.containsKey(referencedFile)){
//                                    outgoing.replace(referencedFile, outgoing.get(referencedFile) + 1);
//                                }
//                                else {
                                outgoing.put(referencedFile, 1);
//                                }
                            }
//                            outgoingArray
//                                    .put(Map.of("file", d.getReferencedFile(), "external", d.isExternal()));
                        }
                    }




                    //outgoingEntry.put("importData", imports);


                    try {
                        dependenciesEntry.put("path", currentPath.toRealPath());
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
//                else{
//                    try {
//                        dependenciesEntry.put("path", currentPath.toRealPath());
//                        dependenciesEntry.put("isDirectory", isDirectory);
//                        dependenciesEntry.put("dirLevel", currentLevel);
//                        dependenciesEntry.put("value", 1);
//                        dependenciesEntry.put("outgoing", outgoingArray);
//                        dependenciesEntry.put("external", externalArray);
//                        dependencies.put(dependenciesEntry);
//                    } catch (IOException e) {
//                        System.err.println("Path Access Depends: " + e.getMessage());
//                    }
//                }
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
            hierarchy.put("path", currentPath.toRealPath());
        } catch (IOException e) {
            System.err.println("Path Access Hierarchy: " + e.getMessage());
        }
        return new HierarchyAndDepends(hierarchy, dependencies, incoming, outgoing, externals);
    }

    private String postProcessDepends(String input, String regex) {

        String output = input.replaceAll(regex,"\"");

        return output;
    }

   private JSONArray addIncomingDependencies(JSONArray dependencies) {
//        System.out.println(dependencies.toString(2));
       for(Object currEditedObject : dependencies){
           JSONObject currEditedElement = (JSONObject) currEditedObject;
           int endIndex = Paths.get(currEditedElement.get("path").toString()).getNameCount();


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
           else {
               HashMap<Path, Integer> newOutgoing = new HashMap<Path, Integer>();

               for(Object currentOutObject : currEditedElement.getJSONArray("outgoing")){

                   Map.Entry<Path, Integer> currEntry = new AbstractMap.SimpleEntry<Path, Integer>(Paths.get(((JSONObject)currentOutObject).get("path").toString()), (Integer)((JSONObject)currentOutObject).get("value"));

//                    System.out.println(currEntry);

                   if(currEntry.getKey().getNameCount()>endIndex){
                       Path newPath = Paths.get(currEntry.getKey().getRoot().toString(),currEntry.getKey().subpath(0, endIndex).toString());

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


//                for(int i=0;i<realPath.getNameCount();i++){
//                    System.out.println(realPath.toString());
//                    System.out.println("i:"+i+"\t"+realPath.getRoot()+realPath.subpath(0, i+1));
//                }


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

//    private void collapseMap(Map<Path, Integer> map, Path referencePath){
//        int endIndex = referencePath.getNameCount();
//        for(Map.Entry<Path, Integer> entry : map.entrySet()) {
//            Path newPath = Paths.get(entry.getKey().getRoot().toString(),entry.getKey().subpath(0, endIndex).toString());
//
////                for(int i=0;i<realPath.getNameCount();i++){
////                    System.out.println(realPath.toString());
////                    System.out.println("i:"+i+"\t"+realPath.getRoot()+realPath.subpath(0, i+1));
////                }
//
//            if(map.containsKey(newPath)) {
//                map.replace(newPath, map.get(newPath) + entry.getValue());
//            }
//            else{
//                map.put(newPath, entry.getValue());
//            }
//        }
//    }
//
////    private void getNames(Path path){
////        System.out.println(path.toString());
////        System.out.println("Name elements: "+path.getNameCount());
////        System.out.println("Subpath 0 to 4: "+path.subpath(0, 4));
////    }
}