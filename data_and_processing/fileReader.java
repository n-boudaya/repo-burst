package data_and_processing;

import java.io.*;
import java.nio.file.*;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.stream.Stream;

import org.json.JSONArray;
import org.json.JSONObject;

import data_and_processing.processors.javascript_processor;
import data_and_processing.processors.processor;

/**
 * fileReader
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

        JSONObject outputJSON = fileTreeToJSON(directory);

        File outputFile = new File("./data_and_processing/file_lists/output_" + currTime + ".json");

        try (BufferedWriter br = new BufferedWriter(new FileWriter(outputFile, true))) {
            br.write(outputJSON.toString());
        } catch (Exception e) {
            System.err.println(e.getMessage());
        }

        // System.out.println("Files are:");

        // try (Stream<Path> paths = Files.walk(directory)) {
        // paths.forEach(p -> {
        // try (BufferedWriter br = new BufferedWriter(new FileWriter(outputFile,
        // true))) {
        // br.write(p.toString() + "\n");
        // System.out.println(p.toString());

        // int dotIndex = p.toString().lastIndexOf(".");
        // ArrayList<data_element> imports = new ArrayList<data_element>();

        // if (dotIndex > 0) {
        // String extension = p.toString().substring(dotIndex + 1);

        // System.out.println("Manual extension found:" + extension);
        // System.out.println("probeContentType:" + Files.probeContentType(p));
        // if (accessibleFiletypes.contains(extension)) {
        // for (processor fP : processors) {
        // for (String type : fP.getFileTypes()) {
        // if (type.equals(extension)) {
        // imports = fP.getImports(p);
        // }
        // }
        // }
        // if (!imports.isEmpty()) {
        // for (data_element d : imports) {
        // System.out.println(d.toString());
        // }
        // }

        // }
        // }

        // }

        // catch (Exception e) {
        // System.err.println(e.getMessage());
        // }
        // });

        // } catch (Exception e) {
        // System.err.println(e.getMessage());
        // }
    }

    private JSONObject fileTreeToJSON(Path currentPath) {
        JSONObject output = new JSONObject();
        
        if (Files.isDirectory(currentPath, LinkOption.NOFOLLOW_LINKS)) {
            System.out.println("Is Directory:"+currentPath.toString());                                    

            JSONArray directoryContentArray = new JSONArray();

            try (DirectoryStream<Path> directoryContentStream = Files.newDirectoryStream(currentPath)) {
                directoryContentStream.forEach(directoryElement -> {
                    directoryContentArray.put(fileTreeToJSON(directoryElement));
                });
            } catch (Exception e) {
                System.err.println(e.getMessage());
            }
            
            output.put("dir_name", currentPath.getFileName());
            output.put("children", directoryContentArray);            
        } else {
            System.out.println("Is File:"+currentPath.toString());
            
            int dotIndex = currentPath.toString().lastIndexOf(".");
            ArrayList<data_element> imports = new ArrayList<data_element>();

            String extension = currentPath.toString().substring(dotIndex + 1);

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
                        System.out.println(d.toString());
                    }
                }

            }

            output.put("file_name", currentPath.getFileName());
            output.put("extension", extension);
            output.put("imports", imports);            
        }

        output.put("path", currentPath);
        return output;
    }
}