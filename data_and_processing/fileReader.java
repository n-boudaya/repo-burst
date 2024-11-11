package data_and_processing;

import java.io.*;
import java.nio.file.*;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Map;

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

    public FileReader(Path directory) {

        searchDirectory = directory;

        processors = new ArrayList<>();

        processors.add(new javascript_processor());

        accessibleFiletypes = new ArrayList<>();

        for (processor p : processors) {
            accessibleFiletypes.addAll(p.getFileTypes());
        }

        outputFiles(directory);
    }

    public static void main(String[] args) {
        FileReader fR = new FileReader(Paths.get("./data_and_processing/raw_data/"));
    }

    public void outputFiles(Path directory) {

        String currTime = ZonedDateTime.now().format(DateTimeFormatter.ofPattern("uuuu-MM-dd-HH-mm-ss"));

        HierarchyAndDepends outputs = fileTreeToJSON(directory,
                new HierarchyAndDepends(new JSONObject(), new JSONArray()), 0);

        addIncomingDependencies(outputs.getDependencies());

        File hierarchyFile = new File("./data_and_processing/file_lists/hierarchy/hierarchy_" + currTime + ".json");

        try (BufferedWriter br = new BufferedWriter(new FileWriter(hierarchyFile, true))) {
            br.write(outputs.getHierarchy().toString());
        } catch (Exception e) {
            System.err.println(e.getMessage());
        }

        File dependenciesFile = new File(
                "./data_and_processing/file_lists/dependencies/dependencies_" + currTime + ".json");

        try (BufferedWriter br = new BufferedWriter(new FileWriter(dependenciesFile, true))) {
            br.write(addIncomingDependencies(outputs.getDependencies()).toString());
        } catch (Exception e) {
            System.err.println(e.getMessage());
        }
    }

    private HierarchyAndDepends fileTreeToJSON(Path currentPath, HierarchyAndDepends lastHierarchyAndDepends, int currentLevel) {
        JSONObject hierarchy = new JSONObject();
        JSONArray dependencies = lastHierarchyAndDepends.getDependencies();
        boolean isDirectory;

        if (Files.isDirectory(currentPath, LinkOption.NOFOLLOW_LINKS)) {
            // System.out.println("Is Directory:" + currentPath.toString());

            // Stores all the child elements of this directory
            JSONArray directoryContentArray = new JSONArray();

            // Tries opening this directory and recursively running this method on each of
            // its elements
            try (DirectoryStream<Path> directoryContentStream = Files.newDirectoryStream(currentPath)) {
                directoryContentStream.forEach(directoryElement -> {
                    HierarchyAndDepends childOutputs = fileTreeToJSON(directoryElement, lastHierarchyAndDepends, currentLevel + 1);

                    directoryContentArray.put(childOutputs.getHierarchy());
                });
            } catch (Exception e) {
                System.err.println(e.getMessage());
            }

            isDirectory = true;

            hierarchy.put("children", directoryContentArray);
        } else {
            // System.out.println("Is File:" + currentPath.toString());

            int dotIndex = currentPath.toString().lastIndexOf(".");

            ArrayList<data_element> imports = new ArrayList<data_element>();
            String extension = "";

            JSONObject outgoingEntry = new JSONObject();
            JSONArray outgoingArray = new JSONArray();

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
                            outgoingArray
                                    .put(Map.of("file", d.getReferencedFile(), "external", d.isExternal()));
                        }
                    }

                    try {
                        outgoingEntry.put("path", currentPath.toRealPath());
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                    outgoingEntry.put("value", 0);
                    outgoingEntry.put("outgoing", outgoingArray);
                    outgoingEntry.put("dirLevel", currentLevel);
                    //outgoingEntry.put("importData", imports);

                    dependencies.put(outgoingEntry);

                }
            }

            hierarchy.put("extension", extension);
            hierarchy.put("imports", imports);

            isDirectory = false;

            try {
                hierarchy.put("value", Files.size(currentPath));
            } catch (IOException e) {
                hierarchy.put("value", -1);
                System.err.println(e.getMessage());
            }
        }

        hierarchy.put("dirLevel", currentLevel);
        hierarchy.put("name", currentPath.getFileName());
        hierarchy.put("isDirectory", isDirectory);

        try {
            hierarchy.put("path", currentPath.toRealPath());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return new HierarchyAndDepends(hierarchy, dependencies);
    }

    private JSONArray addIncomingDependencies(JSONArray dependencies) {
        for(Object currEditedObject : dependencies){
            JSONObject currEditedElement = (JSONObject) currEditedObject;

            JSONArray incoming  = new JSONArray();

            for(Object currViewingObject : dependencies){
                JSONObject currViewingElement = (JSONObject) currViewingObject;

                JSONArray currViewingOutgoings = currViewingElement.getJSONArray("outgoing");

                for (Object outgoingObject : currViewingOutgoings) {
                    JSONObject outgoingElement = (JSONObject) outgoingObject;

                    String currOutgoingPath = outgoingElement.get("file").toString();

                    //System.out.println(currOutgoingPath);

                    if(currOutgoingPath.equals(currEditedElement.get("path").toString())){
                        incoming.put(currViewingElement.get("path").toString());
                    }
                }
            }

            currEditedElement.put("incoming", incoming);
        }

        return dependencies;
    }
}