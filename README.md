# Quiz-App

# !!Die Ausarbeitung befindet sich der [Ausarbeitung.md](Ausarbeitung.md)!!

## Inhaltsverzeichnis
1. [Installation und Setup](#installation-und-setup)
2. [Konfiguration](#konfiguration)
3. [Nutzung der Anwendung](#nutzung-der-anwendung)
   - [Login und Benutzerverwaltung](#login-und-benutzerverwaltung)
   - [Kurse und Studenten](#kurse-und-studenten)
   - [Quiz-Erstellung und -Verwaltung](#quiz-erstellung-und--verwaltung)
   - [Ergebnisse](#ergebnisse)

## Installation und Setup

### Lokale Entwicklungsumgebung
1. Backend starten:
    ```bash
    cd quiz-app-backend
    npm start:dev
    ```
   Das Backend läuft auf Port 3001.

2. Frontend starten:
    ```bash
    cd quiz-app-frontend
    npm start
    ```
   Das Frontend läuft auf Port 3000.

### Docker-Container
1. Docker-Container starten:
    ```bash
    docker-compose up
    ```
   Dabei wird direkt ein Mail-Server mit gestartet.

## Konfiguration

Der Docker-Container benötigt folgende Umgebungsvariablen:

- `SMTP_HOST=mailserver`
- `SMTP_PORT=1025`
- `SMTP_PASS=password`
- `SMTP_USER=admin`
- `QUIZ_DATA_DIR=/opt/data`
- `BACKEND_URL=http://localhost/api`
- `BASE_URL=http://localhost`

Stellen Sie sicher, dass diese Variablen korrekt gesetzt sind, bevor Sie den Container starten.

## Nutzung der Anwendung

### Login und Benutzerverwaltung
1. Beim ersten Aufruf der Anwendung werden Sie auf eine Login-Seite weitergeleitet.
2. Hinterlegen Sie die Nutzerdaten im Backend im Daten-Ordner in der Datei `adminUsers.json` nach folgendem Schema:
    ```json
    {
      "username": "test",
      "password": "test"
    }
    ```
3. Melden Sie sich mit den angegebenen Daten an.

### Kurse und Studenten
1. Nach dem erfolgreichen Login können Sie alle verfügbaren Kurse anzeigen und neue Kurse anlegen.
2. Wählen Sie einen Kurs aus, um Studenten hinzuzufügen. Nutzen Sie die Funktion "CSV hochladen", um eine CSV-Datei zu importieren. Beispiel für `studenten.csv`:
    ```
    Hans Müller,hans.mueller@edu.fhdw.de
    Stefanie Schmitz,stefanie.schmitz@edu.fhdw.de
    ```

3. Nach dem erfolgreichen Import werden die Studenten automatisch per E-Mail benachrichtigt. Sie erhalten dabei einen Link, um das Quiz zu erstellen.Beispiel für den Link:
    ```
    http://localhost/create-quiz?course=Test%20Kurs&quizId=436e2d19-ee08-41e8-8a6e-baab6d4eabd2
    ```

### Quiz-Erstellung und -Verwaltung
1. Unter dem zugestellten Link können die Studenten ihr Quiz erstellen. Sie müssen 10 Fragen mit jeweils 4 Antwortmöglichkeiten und einer richtigen Antwort hinterlegen.
2. Klicken die Studenten auf "QUIZ ERSTELLEN", wird das Quiz angelegt und die Bearbeitungszeit festgelegt.
3. Der Dozent kann die Bearbeitungszeit eines Quizzes im Admin-Bereich ändern. Diese Änderung gilt nur für Studenten, die bereits ein Quiz erstellt haben.
4. Alle Studenten des Kurses erhalten einen Link, um ihre Lösungen einzugeben und abzusenden. Beispiel für den Link:
    ```
    http://localhost/quiz?course=Beispiel%20Kurs&quizId=26f40baf-c69f-40e9-93b0-76a2995d2dbf&studentId=9a1fb262-80c5-4e84-8631-13b2228257ac
    ```

### Ergebnisse
1. Der Dozent kann im Admin-Bereich auf „QUIZ-ERGEBNISSE HERUNTERLADEN“ klicken, um die Ergebnisse herunterzuladen.
2. Die Ergebnisse werden als ZIP-Ordner mit mehreren Dateien bereitgestellt:
    - Dateien nach Namen der Studenten benannt, die die Lösungen der anderen Studenten enthalten. Beispiel für eine Datei `anna-schneider.csv`:
      ```
      Anna Schneider
      Lukas Weber;1:a,2:b,3:a,4:c,5:b,6:d,7:d,8:a,9:b,10:c
      Michael Fischer;1:a,2:b,3:a,4:c,5:b,6:d,7:d,8:a,9:b,10:c
      ```
    - Eine Datei mit allen Lösungen: `Loesungen.csv`
      ```
      Lukas Weber;a;c;c;b;b;b;b;b;a;c
      Anna Schneider;a;c;c;b;b;b;b;b;a;c
      ```