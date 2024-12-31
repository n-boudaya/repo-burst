package fileTypes;

import java.nio.file.*;

//Contains detailed information about an import
public class data_element {
    private final Path sourceFile;      //The source file of the import. Which file wants to import?
    private final Path referencedFile;  //The file accessed by the import.
    private final boolean external;     //Is the file that should be imported local to the repository (false) or is it an external library (true)?

    private final int lineNumber;       //Position of the import in the file.
    private final String lineContent;   //The actual text of the line that contains the import.

    public data_element(int pLineNumber, String pLineContent, Path pSourceFile, Path pReferencedFile, boolean pExternal) {
        lineNumber = pLineNumber;
        lineContent = pLineContent;
        sourceFile = pSourceFile;
        referencedFile = pReferencedFile;
        external = pExternal;
    }

    public int getLineNumber() {
        return lineNumber;
    }

    public String getLineContent() {
        return lineContent;
    }

    public Path getSourceFile() {
        return sourceFile;
    }

    public Path getReferencedFile() {
        return referencedFile;
    }

    public boolean isExternal() {
        return external;
    }

    public String toString() {
        String output = "Line Number: " + lineNumber + System.lineSeparator();
        output = output + "Line Content: " + lineContent + System.lineSeparator();
        output = output + "Referenced File: " + referencedFile.toString() + System.lineSeparator();

        return output;
    }
}
