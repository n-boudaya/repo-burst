package data_and_processing.processors;

import java.nio.file.*;
import java.util.ArrayList;

import data_and_processing.data_element;

public abstract class processor {
    public abstract ArrayList<String> getFileTypes();

    public abstract ArrayList<data_element> getImports(Path p);
}
