package data_and_processing;

import java.io.*;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collection;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.filefilter.TrueFileFilter;

/**
 * fileReader
 */
public class fileReader {

    public static void main(String[] args) {
        System.out.println("Hello world!");

        fileReader fR = new fileReader();

        File f = new File("./data_and_processing/raw_data/");

        fR.outputFiles(f);
    }

    public void outputFiles(File directory) {
        try {
            String currTime = ZonedDateTime.now().format(DateTimeFormatter.ofPattern("uuuu-MM-dd-HH-mm-ss"));

            File outputFile = new File("./data_and_processing/file_lists/output_" + currTime + ".txt");

            System.out.println("Files are:");

            for (File f : FileUtils.listFiles(directory, TrueFileFilter.INSTANCE, TrueFileFilter.INSTANCE)) {
                try (BufferedWriter br = new BufferedWriter(new FileWriter(outputFile, true))) {
                    br.write(f.getPath() + "\n");
                }

                catch (Exception e) {
                    System.err.println(e.getMessage());
                }
            }
        } catch (Exception e) {
            System.err.println(e.getMessage());
        }
    }
}