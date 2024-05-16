# Motivation des Projektes

Das Projekt bildet eine Quiz-Anwendung ab. In der Anwendung soll
es für Studenten möglich sein, ein eigenes Quiz für einen Kurs 
zu erstellen. Dieses Quiz soll mit Fragen und Antworten versehen 
werden können. Studenten sollen aber gleichzeitig auch in der Lage
sein, Antworten für die Quizzes der anderen Studenten abzugeben. 
Die Quizzes sind dabei nach einzelnen Veranstaltungen aufgeteilt. 
Zuletzt soll es dem Dozenten möglich eine Auswertung nach Veranstaltung
und Quiz sortiert herunterzuladen, die die Antworten der einzelnen
Studenten angibt.

# Nutzen der Anwendung

## Für den Dozenten

Die Anwendung soll Abfrage von Quizzes innerhalb einer Vorlesung deutlich 
vereinfachen. Durch die automatisierte Erstellung von Quiz-Inhalten und
der definierten Erstellung von Antwortdateien soll der Prüfungsbetrieb 
innerhalb der Vorlesung an Effizienz gewinnen. Der Dozent muss nicht mehr
manuell die Antwortmöglichkeiten der Studierenden auswerten.

## Für die Studenten

Die Studenten können sich durch die Digitalisierung des Quiz-Prozesses
auf eine standardisierte und sichere Abfrage ihrer Antworten verlassen. 
Sie können selbstständig und zeitunabhängig ihre eigenen Quizzes in die
Anwendung eintragen. 

# Technische Anforderungen

Da das Projekt im Rahmen der Vorlesung "Projekt Web-Entwicklung" umgesetzt
wird, soll die Anwendung als Webanwendung bereitgestellt werden. 

## Frontend 

Das Frontend des Projektes muss sowohl für Studenten, als auch für den
Dozenten zur Verfügung stehen. Die Schwierigkeit wird es sein, diese zwei
Bereiche voneinander abzugrenzen. Außerdem werden zu Verwaltung der Quizzes 
einige Nutzeroberfläche vonnöten sein. Die technische Basis des Frontend 
bildet [Vue3](https://vuejs.org/), ein auf JavaScript basierendes Framework 
zur Erstellung von Frontends. 

## Backend

Das Backend dient zur Kommunikation mit dem Frontend und zur Persistierung
der Daten. Die Daten sollen hierbei ohne Datenbank auskommen und als Dateien
angelegt werden. Die technische Basis des Backends bildet [NodeJS](https://nodejs.org/en)
im Zusammenhang mit [Express](https://expressjs.com/). Diese ermöglichen eine
Serveranwendung auf der Basis von JavaScript.