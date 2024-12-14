Ziel:
Eine webbasierte Anwendung zur Visualisierung von Abhängigkeiten zwischen Code-Dateien über verschiedene Zeitpunkte in der Entwicklung.

Wichtige Paper:
D. Holten, "Hierarchical Edge Bundles: Visualization of Adjacency Relations in Hierarchical Data," in IEEE Transactions on Visualization and Computer Graphics, vol. 12, no. 5, pp. 741-748, Sept.-Oct. 2006, https://doi.org/10.1109/TVCG.2006.147

Liu, H., Tao, Y., Huang, W. et al. Visual exploration of dependency graph in source code via embedding-based similarity. J Vis 24, 565–581 (2021). https://doi.org/10.1007/s12650-020-00727-x


Zweites Paper ist besonders relevant, da hier etwas ähnliches versucht wurde wie ich erreichen möchte.
Für die Beispielvisualisierungen haben die auch D3 benutzt, lustiger Zufall. Bietet sich aber natürlich an, da die das auch verwenden um die Visualisierungen zu generieren. Sehr großer Vorteil ist, dass die in dem Paper eine User-Study gemacht haben.
Zentraler Unterschied: Ich möchte den Fokus auf den Vergleich verschiedener Commits legen und die Differenzen über die Zeit hinweg anschaulich machen.

Features:
-Sunburst mit Directories in äußerster Ebene und subdirectories innen, bis zur Dataeienebene
-Innerer Kreis des Sunburst enthält Kanten, die die Abhängigkeiten zwischen den Dateien darstellen (Imports)
-Edgebundling der Kanten soll lesbarkeit verbessern

Innerste Elemente aus Sunburst sammeln
Für jedes: Find passende Group, alle Chords die dazu gehören
Alle, die zu außerhalb liegenden Elementen führen entfernen(ausstart und end 0 setzen)



