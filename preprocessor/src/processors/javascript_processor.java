package processors;

import java.nio.file.*;
import java.nio.charset.*;
import java.io.*;
import java.util.regex.*;
import java.util.ArrayList;

import fileTypes.data_element;

public class javascript_processor extends processor {

    public ArrayList<String> getFileTypes() {
        ArrayList<String> supportedFileTypes = new ArrayList<String>();

        supportedFileTypes.add("js");

        return supportedFileTypes;
    }

    public ArrayList<data_element> getImports(Path path) {
        ArrayList<data_element> result = new ArrayList<data_element>();

        Pattern pattern = Pattern.compile("^import(.+?)from\\s[\\\",\\'](?<path>.+)[\\\",\\'];$");

        try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
            int lineNumber = 0;
            String line = null;
            while ((line = reader.readLine()) != null) {
                Matcher matcher = pattern.matcher(line);
                if (matcher.matches()) {
                    // ? in import paths can denote additional parameters passed to the imported file
                    //All imports should also be absolute, so no : in the path
                    //Those mess up later path detection, so they are split off
                    Path referencedPath = Paths.get(matcher.group("path").split("\\?", 2)[0].split(":", 2)[0]);
                    try {
                        Path absoluteReferencedPath = path.toAbsolutePath().toRealPath().resolveSibling(referencedPath).toRealPath();
//                        System.out.println("Working Path found");
//                        System.out.println("Current File: " + path.toString());
//                        System.out.println("Current import: " + referencedPath.toString());
//                        System.out.println("Absolute referenced path: " + absoluteReferencedPath.toString());
//                        System.out.println("Current working dir: " + System.getProperty("user.dir"));

                        result.add(new data_element(lineNumber, line, path.toRealPath(), absoluteReferencedPath, false));
                    } catch (IOException e) {
//                        System.out.println("External Path found");
//                        System.out.println("Current File: " + path.toString());
//                        System.out.println("Current import: " + referencedPath.toString());

                        result.add(new data_element(lineNumber, line, path, referencedPath, true));
                    }

//                    System.out.println("Line: "+line);
//                    System.out.println("ReferencedPath: " + referencedPath.toString());
//                    System.out.println("Path: "+path.toString());


                }

                lineNumber++;
            }
        } catch (IOException x) {
            System.err.format("IOException: %s%n", x);
        }

        return result;
    }
}
