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
                new HierarchyAndDepends(new JSONObject(), new JSONArray()));

        File hierarchyFile = new File("./data_and_processing/file_lists/hierarchy/hierarchy_" + currTime + ".json");

        try (BufferedWriter br = new BufferedWriter(new FileWriter(hierarchyFile, true))) {
            br.write(outputs.getHierarchy().toString());
        } catch (Exception e) {
            System.err.println(e.getMessage());
        }

        File dependenciesFile = new File(
                "./data_and_processing/file_lists/dependencies/dependencies_" + currTime + ".json");

        try (BufferedWriter br = new BufferedWriter(new FileWriter(dependenciesFile, true))) {
            br.write(outputs.getDependencies().toString());
        } catch (Exception e) {
            System.err.println(e.getMessage());
        }
    }

    private HierarchyAndDepends fileTreeToJSON(Path currentPath, HierarchyAndDepends lastHierarchyAndDepends) {
        JSONObject hierarchy = new JSONObject();
        JSONArray dependencies = lastHierarchyAndDepends.getDependencies();

        if (Files.isDirectory(currentPath, LinkOption.NOFOLLOW_LINKS)) {
            // System.out.println("Is Directory:" + currentPath.toString());

            // Stores all the child elements of this directory
            JSONArray directoryContentArray = new JSONArray();

            // Tries opening this directory and recursively running this method on each of
            // its elements
            try (DirectoryStream<Path> directoryContentStream = Files.newDirectoryStream(currentPath)) {
                directoryContentStream.forEach(directoryElement -> {
                    HierarchyAndDepends childOutputs = fileTreeToJSON(directoryElement, lastHierarchyAndDepends);

                    directoryContentArray.put(childOutputs.getHierarchy());
                });
            } catch (Exception e) {
                System.err.println(e.getMessage());
            }

            hierarchy.put("name", currentPath.getFileName());
            hierarchy.put("children", directoryContentArray);
        } else {
            // System.out.println("Is File:" + currentPath.toString());

            int dotIndex = currentPath.toString().lastIndexOf(".");

            ArrayList<data_element> imports = new ArrayList<data_element>();
            String extension = "";

            JSONObject currentDependenciesEntry = new JSONObject();
            JSONArray currentDependenciesArray = new JSONArray();

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
                            currentDependenciesArray
                                    .put(Map.of("file", d.getReferencedFile(), "external", d.isExternal()));
                        }
                    }

                    try {
                        currentDependenciesEntry.put("path", currentPath.toRealPath());
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                    currentDependenciesEntry.put("value", 0);
                    currentDependenciesEntry.put("dependencies", currentDependenciesArray);
                    currentDependenciesEntry.put("importData", imports);

                    dependencies.put(currentDependenciesEntry);

                }
            }




            hierarchy.put("name", currentPath.getFileName());
            hierarchy.put("extension", extension);
            hierarchy.put("imports", imports);

            try {
                hierarchy.put("value", Files.size(currentPath));
            } catch (IOException e) {
                hierarchy.put("value", -1);
                System.err.println(e.getMessage());
            }
        }

        try {
            hierarchy.put("path", currentPath.toRealPath());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return new HierarchyAndDepends(hierarchy, dependencies);
    }
}