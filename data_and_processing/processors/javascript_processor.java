package data_and_processing.processors;

import java.nio.file.*;
import java.nio.charset.*;
import java.io.*;
import java.util.regex.*;
import java.util.ArrayList;

import data_and_processing.data_element;

public class javascript_processor extends processor {

    public ArrayList<String> getFileTypes() {
        ArrayList<String> supportedFileTypes = new ArrayList<String>();

        supportedFileTypes.add("js");

        return supportedFileTypes;
    }

    public ArrayList<data_element> getImports(Path path) {
        ArrayList<data_element> result = new ArrayList<data_element>();

        Pattern pattern = Pattern.compile("^import(.+?)from\\s\\\"(?<path>.+)\\\";$");

        try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
            int lineNumber = 0;
            String line = null;
            while ((line = reader.readLine()) != null) {
                Matcher matcher = pattern.matcher(line);
                if (matcher.matches()) {
                    Path referencedPath = Paths.get(matcher.group("path"));

                    boolean external;

                    try {
                        Path absoluteReferencedPath = path.toAbsolutePath().toRealPath().resolveSibling(referencedPath).toRealPath();
                        external = false;
                        System.out.println("Working Path found");
                        System.out.println("Current File: " + path.toString());
                        System.out.println("Current import: " + referencedPath.toString());
                        System.out.println("Absolute referenced path: " + absoluteReferencedPath.toString());
                    } catch (IOException e) {
                        external = true;
                        System.out.println("External Path found");
                        System.out.println("Current File: " + path.toString());
                        System.out.println("Current import: " + referencedPath.toString());
                    }


                    result.add(new data_element(lineNumber, line, referencedPath, external));
                }

                lineNumber++;
            }
        } catch (IOException x) {
            System.err.format("IOException: %s%n", x);
        }

        return result;
    }
}
