package data_and_processing;

import java.nio.file.*;

public class data_element {
    private final int lineNumber;
    private final String lineContent;
    private final Path sourceFile;
    private final Path referencedFile;
    private final boolean external;

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

    public Path getSourceFile() {return sourceFile;}

    public Path getReferencedFile() {
        return referencedFile;
    }

    public boolean isExternal() { return external; }

    public String toString(){
        String output = "Line Number: " + lineNumber + System.lineSeparator();
        output = output + "Line Content: " + lineContent + System.lineSeparator();
        output = output + "Referenced File: " + referencedFile.toString() + System.lineSeparator();

        return output;
    }
}
