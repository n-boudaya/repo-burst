package data_and_processing;

import java.io.*;
import java.nio.file.*;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.stream.Stream;

import data_and_processing.processors.javascript_processor;
import data_and_processing.processors.processor;

/**
 * fileReader
 */
public class FileReader {

    Path searchDirectory;
    ArrayList<processor> processors;
    ArrayList<String> accessibleFiletypes;

    public FileReader(Path directory){
        
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

            File outputFile = new File("./data_and_processing/file_lists/output_" + currTime + ".txt");

            System.out.println("Files are:");

            try(Stream<Path> paths = Files.walk(directory)) {
                paths.filter(f -> !Files.isDirectory(f)).forEach(p -> {
                    try (BufferedWriter br = new BufferedWriter(new FileWriter(outputFile, true))) {
                        br.write(p.toString() + "\n");
                        System.out.println(p.toString());

                        int dotIndex = p.toString().lastIndexOf(".");
                        ArrayList<data_element> imports = new ArrayList<data_element>();

                        if(dotIndex>0){
                            String extension = p.toString().substring(dotIndex+1);

                            System.out.println(extension);
                            if(accessibleFiletypes.contains(extension)){
                                for (processor fP : processors) {
                                    for (String type : fP.getFileTypes()) {
                                        if(type.equals(extension)){
                                            imports = fP.getImports(p);
                                        }
                                    }
                                }
                                if(!imports.isEmpty()){
                                    for (data_element d : imports) {
                                        System.out.println(d.toString());
                                    }
                                }

                            }
                        }

                    }

                    catch (Exception e) {
                        System.err.println(e.getMessage());
                    }
                });

        } catch (Exception e) {
            System.err.println(e.getMessage());
        }
    }
}