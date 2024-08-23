package data_and_processing;

import java.io.*;
import java.nio.file.*;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

/**
 * fileReader
 */
public class fileReader {

    public static void main(String[] args) {
        System.out.println("Hello world!");

        fileReader fR = new fileReader();

        Path p = Paths.get("./data_and_processing/raw_data/");

        fR.outputFiles(p);
    }

    public void outputFiles(Path directory) {
        try {
            String currTime = ZonedDateTime.now().format(DateTimeFormatter.ofPattern("uuuu-MM-dd-HH-mm-ss"));

            File outputFile = new File("./data_and_processing/file_lists/output_" + currTime + ".txt");

            System.out.println("Files are:");

            Files.walk(directory, FileVisitOption.FOLLOW_LINKS).filter(f -> !Files.isDirectory(f)).forEach(p -> {
                try (BufferedWriter br = new BufferedWriter(new FileWriter(outputFile, true))) {
                    br.write(p.toString() + "\n");
                    System.out.println(p.toString());
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