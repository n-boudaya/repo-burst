# Planung
- Verarbeitung von einzelnem Zeitpunkt des Datensatzes soweit fertig
- Nächster Schritt: Verarbeitung weiterer Zeitschritte ermöglichen
- Dann: Referenz-Implementation von Sunburst-Diagramm auf eigene Daten anpassen
- Reihenfolge der Ebenen umtauschen, sodass höchste Hierarchie-Ebene außen steht.



- ~~D3 Einarbeitung~~  
  Einarbeitung in javascript und D3 mithilfe von [diesem Tutorial](https://youtu.be/xkBheRZTkaw?si=9wbG6xvtOIbCFZ8w)
  Hat gute Grundlage für Arbeit mit D3 gegeben. Hauptsächlich Fokus auf Bogensegmente gelegt, da diese später für das Sunburst-Diagramm benötigt werden. [Eins der Ergebnisse.](https://vizhub.com/n-boudaya/815b09be96e8430592b357a7217a2598)
- Git scraping  
    Testen, ob benötigte Daten in nutzbarer Form aus git-Repositories extrahiert werden können. Gutes Repository [hier.](https://github.com/d3/d3-shape?tab=readme-ov-file) Es verwendet nur eine Sprache, hat eine mittellange Commit-History und Branches usw. um verschiedene Features zu testen. Für Beispiel [hier gucken.](https://stackoverflow.com/questions/51131530/export-all-commits-into-zip-files-or-directories)
- Mockup UI  
    In Photoshop getestet, das ist zu aufwendig. Könnte in Textform + [Figma](https://www.figma.com/) gemacht werden.
- Implementierung des Sunburst-Diagramms  
    [Hier ist eine gute Grundlage.](https://observablehq.com/@d3/zoomable-sunburst?intent=fork) Allerdings sollte die Hierarchie für dieses Programm genau andersherum angeordnet sein. Außerdem könnte z.B. die Anzahl der Level parametrisiert werden.