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

        Pattern pattern = Pattern.compile("^import(.+?)from\s\"(?'path'.+)\";$");

        try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
            int lineNumber = 0;
            String line = null;
            while ((line = reader.readLine()) != null) {
                Matcher matcher = pattern.matcher(line);
                if (matcher.matches()) {
                    Path referencedPath = Paths.get(matcher.group("path"));

                    result.add(new data_element(lineNumber, line, referencedPath));
                }

                lineNumber++;
            }
        } catch (IOException x) {
            System.err.format("IOException: %s%n", x);
        }

        return result;
    }
}
