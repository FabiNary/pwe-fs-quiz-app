# Projekt: Web-Entwicklung - Dokumentation der Quiz-App

## Inhaltsverzeichnis

   - [Technische Grundlagen](#technische-grundlagen)
      - [NestJS](#nestjs)
      - [Vue](#vue)
      - [Docker](#docker)
   - [Funktionalität der Anwendung](#funktionalität-der-anwendung)
      - [Authentifizierung und Kursverwaltung](#authentifizierung-und-kursverwaltung)
      - [Quiz-Erstellung und -Verwaltung](#quiz-erstellung-und--verwaltung)
      - [Ergebnisverwaltung](#ergebnisverwaltung)
   - [Implementierung](#implementierung)
      - [Implementierung des Frontends](#implementierung-des-frontends)
      - [Implementierung des Backends](#implementierung-des-backends)
      - [Implementierung der Containerisierung](#implementierung-der-containerisierung)
   - [Fazit](#fazit)
   - [Ausblick](#ausblick)

## Technische Grundlagen

### NestJS

NestJS ist ein auf Node.js basierendes Framework zur Erstellung von Backend Anwendungen. Es legt der Anwendung eine
standardisierte Architektur zugrunde, welche eine schnelle Skalierung und eine hohe, modulare Testbarkeit
gewährleistet. Es ermöglicht eine leichte Einbindung externer Frameworks, wie OpenAPI oder nodemailer.
(Quelle: [docs.nestjs.com](https://docs.nestjs.com/))

### Vue

Vue ist ein auf JavaScript basierendes Framework, um Web-Frontends zu erstellen. Seine leichte Erlernbarkeit führt zu
schnellen Ergebnissen. Durch interaktive Elemente und Erweiterungen wie vue-router lassen sich Single-Page-Applications
schnell erzeugen. (Quelle: [vuejs.org](https://vuejs.org/guide/introduction.html))

### Docker

Docker bildet eine Basis, um eine Softwareanwendung samt ihrer Abhängigkeiten in einem Container abzubilden. Ein
Container teilt sich hierbei den Kernel des Host-Betriebssystems. Hierdurch kann sichergestellt werden, dass Software
sich sowohl in der lokalen Entwicklungsumgebung, als auch in der später Produktivumgebung gleich verhält.
(Quelle: [docker.com](https://www.docker.com/resources/what-container/))

## Funktionalität der Anwendung

Die Anwendung unterstützt sowohl Studenten, als auch den Dozenten bei einer korrekten Abfrage einer Prüfungsleistung in 
Form eines Quizzes. Dozenten können ihre Kurse als Admin der Anwendung verwalten und Studenten können ihre Quizzes
in einem standardisierten Format erstellen und anderen Studenten zur Verfügung stellen. 

### Authentifizierung und Kursverwaltung

Beim Aufruf der Anwendung wird der Nutzer zunächst auf eine Login-Seite weitergeleitet. Nach erfolgreichem Login können 
alle verfügbaren Kurse eingesehen und neue Kurse durch den Dozenten angelegt werden. Für die Verwaltung der Kurse können 
Studenten über eine CSV-Datei importiert werden, welche die Namen und E-Mail-Adressen der Studenten enthält. Nach 
erfolgreichem Import werden die Studenten automatisch per E-Mail benachrichtigt und erhalten einen Link, um ihr Quiz zu 
erstellen.

### Quiz-Erstellung und -Verwaltung

Die Studenten können über den zugestellten Link ihr individuelles Quiz erstellen, welches aus 10 Fragen mit jeweils 4
Antwortmöglichkeiten und einer korrekten Antwort besteht. Dozenten haben danach die Möglichkeit, die Bearbeitungszeit 
eines Quizzes im Admin-Bereich nachträglich zu ändern. Bei Änderung der Bearbeitungszeit werden alle betroffenen 
Studenten per E-Mail benachrichtigt und erhalten einen neuen Link, um ihre Lösungen einzugeben und abzusenden.

### Ergebnisverwaltung

Bis zur Erreichung der Bearbeitungszeit können die Studenten ihre Lösungen über den entsprechenden Link einreichen. Der
Dozent kann im Admin-Bereich die Quiz-Ergebnisse herunterladen. Diese werden in einem ZIP-Ordner bereitgestellt, der 
mehrere Dateien enthält: eine Datei pro Student mit den jeweiligen Lösungen sowie eine Gesamtdatei, die alle Lösungen 
zusammenfasst.

## Implementierung

Zu Beginn der Entwicklung einer Web-Anwendung stehen einige organisatorische Routineaufgaben, welche abgeschlossen 
werden müssen. Da das Projekt im Ergebnis als Container-Anwendung zur Verfügung stehen soll, wurden in einem 
Projektordner zwei Unterordner für Frontend und Backend erstellt. Leider wurde während der Entwicklung nicht darauf
geachtet, dass bereits ein GitHub Repository zur Verfügung steht. Dies wurde erst während der Implementierungsphase
anglegt.

### Implementierung des Frontends

Zu Beginn des Projektes wurde das Frontend implementiert. Vue bietet mit der Vue-CLI bereits einen Workflow, welcher
ein vorkonfiguriertes Projekt erstellt. Dieser wurde mit dem `vue-cli create quiz-app-frontend` gestartet. Darauf 
aufbauend konnten die benötigten Fronted-Komponenten umgesetzt werden. Es wurden insgesamt 5 Komponenten benötigt,
wobei eine der Komponenten den Header für die insgesamt 4 Frontend-Oberflächen darstellt. Die 
[CreateQuiz.vue](quiz-app-frontend%2Fsrc%2Fcomponents%2FCreateQuiz.vue) ermöglicht einem Studenten mit den korrekt
angegebenen Query-Parametern ein Quiz zu erstellen. Die [SolveQuiz.vue](quiz-app-frontend%2Fsrc%2Fcomponents%2FSolveQuiz.vue) benötigt 
sowohl die Studenten-ID, als auch die 
Quiz-Id als Query-Parameter und erzeugt damit eine Eingabemaske für eine Lösung des Quizzes. Die [Login.vue](quiz-app-frontend%2Fsrc%2Fcomponents%2FLogin.vue) bietet eine Login-Maske, welche mit den korrekt 
eingegebenen Zugangsdaten zur Admin-Oberfläche weiterleitet. [Admin.vue](quiz-app-frontend%2Fsrc%2Fcomponents%2FAdmin.vue) 
bietet eine Admin-Oberfläche zu Verwaltung der in Abschnitt 2 beschriebenen Funktionalitäten für den Dozenten. 

### Implementierung des Backends

Im Backend wird die in Abschnitt 2 beschriebene Funktionalität der Anwendung dargestellt. Hierfür wurde NestJS als
Framework gewählt. NestJS bietet durch einen CLI-Workflow die Möglichkeit, ein vorkonfiguriertes Projekt zu erstellen.
Dies wurde mit `nest new quiz-app-backend` erzeugt. Innerhalb des Projektes mussten allerdings noch einige
Abhängigkeiten installiert werden. Unter anderem `@nestjs/config` zum automatisierten Laden von Umgebungsvariablen,
`nodemailer` zum versenden der E-Mails und `@nestjs/swagger`, um eine automatische API-Dokumentation zu erzeugen. 
Anschließend wurden gemäß dem NestJS einige Module erzeugt, die die Fachlichkeiten der Objekte bestmöglich 
wiederspiegeln sollen. Ein Modul dient in NestJS allerdings lediglich zur Kapselung und die damit verbundene Verwaltung
von Abhängigkeiten. Deshalb wurden, falls nötig, noch Controller zum Management der HTTP-Routen, Services zur 
Bereitstellung der Funktionalitäten und DTOs als Objekte zu Datenhaltung erzeugt. Dabei entstanden folgende Module:
- Das `Course`-Modul, welches sich um die Verwaltung einzelner Kurse kümmert. Hier können Kurse abgerufen oder erstellt
werden. Außerdem können hier die Quiz-Ergebnisse eines Kurses als ZIP-Datei abgerufen werden. 
- Das `Student`-Modul, welches die Möglichkeit bietet, Studenten zu einem Kurs per CSV-Datei hinzuzufügen und die 
jeweiligen Studenten innerhalb eines Kurses zu erhalten.
- Das `Quiz`-Modul. Hier können neue Quizzes hinzugefügt werden. Es ist zudem möglich, die Fragen eines Quizzes ohne
dessen Antworten zu erhalten. Zudem kann man als Student seine Lösung dem Quiz hinzufügen. Außerdem kann man den
Bearbeitungszeitraum eines Quizzes abfragen und ändern. 
- Das `Login` Modul bietet die Möglichkeit, sich mit dem richtigen Nutzernamen und Passwort einzuloggen.
- Das `Mailer` Modul stellt die technische Funktionalität zum Versenden von E-Mails bereit.

Um nun im Frontend die Informationen bereitzustellen, welche Routen unter welchem Pfad zur Verfügung stehen, wurde
das OpenAPI Tool genutzt, um diese Informationen in einem Ordner im Frontend zur Verfügung zu stellen. Dafür wurde der
Befehl `openapi-generator-cli generate -i ./quiz-app-backend/dist/swagger.json -g typescript-axios -o ./quiz-app-frontend/src/app`
genutzt. So konnten Backend und Frontend miteinander kommunizieren.

### Implementierung der Containerisierung

Die Anwendung sollte im produktiven Betrieb als Container zur Verfügung stehen. Deshalb musste eine Dockerfile
erstellt werden, welche angibt, wie das Docker Image der Anwendung erstellt werden soll. Grundsätzlich nutzt die
Anwendung einen Two-Stage-Build sowohl für das Frontend, als auch für das Backend. Hierbei werden die Code-Artefakte
erzeugt, die in einem späteren Schritt durch einen auf das Hosting optimierten Container ausgespielt werden. 
Der Hosting-Container nutzt NGNIX und NodeJS für das Hosting beider Dienste. Hierfür konnte ein vorgefertigter
NGINX-Container genutzt. In diesem wurde allerdings noch NodeJS und supervisor, eine Software zur Verwaltung von 
mehreren Serveranwendungen auf einem Betriebssystem nachinstalliert. supervisor wurde in der [supervisord.conf](docker%2Fsupervisord.conf)-Datei konfiguriert.
Die [nginx.conf](docker%2Fnginx.conf) konfiguriert NGINX dabei so, dass alle Anfragen, welche auf den Pfad `/api/*`
gehen auf das Backend umgeleitet werden. Somit lief der Service in einem Container.

## Fazit

Es konnte im Umfang der Prüfungsleistung eine funktionale Anwendung entwickelt werden. Alle geforderten Features konnten
umgesetzt werden. Es mussten allerdings an manchen Stellen auch Kompromisse eingegangen werden. Der sicherheitskritische
Admin-Bereich ist zwar mit einer Login-Maske geschützt, allerdings kann diese leicht durch das Setzen eines Attributes
im lokalen Browser-Speicher umgangen werden. Außerdem ist es eher unüblich, Backend und Frontend innerhalb eines 
Containers auszuspielen. Dieser Kompromiss wurde zur Verringerung der Komplexität im Betrieb der Anwendung eingegangen.
Die Konfiguration der Routen in NGINX wurde gestaltete sich durch diesen Kompromiss besonders schwierig.
Als besonders einfach und intuitiv gestaltete sich sowohl das Versenden von E-Mails innerhalb der Anwendung, als auch
die automatische Code-Erzeugung durch OpenAPI, um Schnittstellen zwischen Frontend und Backend zu erzeugen.

## Ausblick

Die Anwendung bietet einige Potenziale zu Erweiterung und Verbesserung. So könnte die Sicherheit durch ein sichereres
Authentifizierungsverfahren, zum Beispiel mittels JWT-Token erhöht werden. So könnte für einzelne Studenten eine
Rolle vergeben werden, welche sie nur zu gewissen Handlungen berechtigt. Außerdem könnten so Routen im Backend sicher
geschützt werden. Zudem könnte die Anwendung durch eine automatische Auswertung der Quiz-Ergebnisse pro Student 
erweitert werden. Außerdem sind Funktionalitäten, wie das Löschen eines Studenten per UI oder die Speicherung der
Information, ob ein Schüler bereits eine Mail erhalten hat denkbar. 


