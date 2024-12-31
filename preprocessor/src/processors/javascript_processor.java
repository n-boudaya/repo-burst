package processors;

import java.nio.file.*;
import java.nio.charset.*;
import java.io.*;
import java.util.regex.*;
import java.util.ArrayList;

import fileTypes.data_element;

//Processor for javascript files. Extracts imports/dependencies, formats those and outputs a list of all dependencies in the current file.
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

            //Runs through every line of the file, finds imports according to pattern, and writes every found import to a data_element.
            while ((line = reader.readLine()) != null) {
                Matcher matcher = pattern.matcher(line);

                if (matcher.matches()) {
                    // ? in import paths can denote additional parameters passed to the imported file
                    //All imports should also be absolute, so no : in the path
                    //Those mess up later path detection, so they are split off
                    Path referencedPath = Paths.get(matcher.group("path").split("\\?", 2)[0].split(":", 2)[0]);

                    try {
                        //Since path is pieced together out of relative paths, it has to be converted to a regular absolute path like this.
                        //Existence of the file is also checked by converting it to a real path
                        Path absoluteReferencedPath = path.toAbsolutePath().toRealPath().resolveSibling(referencedPath).toRealPath();

                        result.add(new data_element(lineNumber, line, path.toRealPath(), absoluteReferencedPath, false));
                    } catch (IOException e) {
                        result.add(new data_element(lineNumber, line, path, referencedPath, true));
                    }
                }
                lineNumber++;
            }
        } catch (IOException x) {
            System.err.format("IOException: %s%n", x);
        }

        return result;
    }
}
