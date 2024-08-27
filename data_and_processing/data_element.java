package data_and_processing;

import java.nio.file.*;

public class data_element {
    private int lineNumber;
    private String lineContent;
    private Path referencedFile;

    public data_element(int pLineNumber, String pLineContent, Path pReferencedFile) {
        lineNumber = pLineNumber;
        lineContent = pLineContent;
        referencedFile = pReferencedFile;
    }

    public int getLineNumber() {
        return lineNumber;
    }

    public String getLineContent() {
        return lineContent;
    }

    public Path getReferencedFile() {
        return referencedFile;
    }

    public String toString(){
        String output = "Line Number: " + lineNumber + System.lineSeparator();
        output = output + "Line Content: " + lineContent + System.lineSeparator();
        output = output + "Referenced File: " + referencedFile.toString() + System.lineSeparator();

        return output;
    }
}
