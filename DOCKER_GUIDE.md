# 🐳 Guida Completa Docker per School AI Avatar

Questa guida ti accompagna passo passo nella verifica e nell'avvio del progetto con Docker.
**Nota:** Questo file è per tuo uso personale. Puoi cancellarlo prima di consegnare il progetto.

## 1. Verifica Preliminare
Prima di tutto, assicuriamoci che Docker sia pronto.
1.  Apri **Docker Desktop** (l'applicazione con la balena).
    *   Deve esserci un bollino verde o la scritta "Engine running" in basso a sinistra.
2.  Apri un terminale (PowerShell o il terminale di VS Code) e prova questo comando:
    ```powershell
    docker compose version
    ```
    *   Se ti risponde con una versione (es. `Docker Compose version v2...`), sei pronto.
    *   *Se ti dà errore, prova a scrivere `docker-compose version` (con il trattino).*

## 2. Avvio del Progetto (La prova del nove)
Ora accendiamo tutto.

1.  Apri il terminale nella cartella del progetto (`school-ai-avatar`).
2.  Lancia il comando magico:
    ```powershell
    docker compose up --build
    ```
    *(Nota: se il comando sopra non va, prova `docker-compose up --build` con il trattino)*

3.  **Cosa deve succedere:**
    *   Vedrai scaricare e costruire diverse cose (le prime volte ci mette un po').
    *   Alla fine vedrai scritte colorate tipo `[frontend] ...` e `[backend] ...`.
    *   Il terminale rimarrà "bloccato" in ascolto. È GIUSTO COSÌ.

## 3. Test Manuale (Come vedere se funziona)
Mentre il terminale è aperto e lavora:

1.  **Apri il Browser (Chrome/Edge):**
    *   Vai su: [http://localhost](http://localhost)
    *   Dovresti vedere il sito caricarsi perfettamente.
2.  **Testa le API:**
    *   Prova a fare una domanda all'avatar o a caricare una lezione.
    *   Se l'avatar risponde, il collegamento tra Frontend, Backend e Database (nel container) funziona!

## 4. Gestione tramite "Docker Dashboard" (Più facile!)
Visto che hai l'estensione/app:
1.  Apri la **Dashboard di Docker Desktop**.
2.  Vedrai un gruppo chiamato `school-ai-avatar`.
3.  Puoi cliccare il tasto "Stop" (quadratino) o "Start" (triangolino) per spegnere e accendere tutto il progetto senza usare il terminale.
4.  Se clicchi sul nome, puoi vedere i "Log" (quello che succede dentro) per controllare se ci sono errori.

## 5. Pulizia (Prima di consegnare)
Se vuoi essere sicuro che l'ingegnere riceva una cosa pulita:
1.  Spegni tutto (CTRL+C nel terminale o Stop dalla Dashboard).
2.  Cancella la cartella `node_modules` se l'hai creata nel tuo PC (non serve a Docker, ma pesa).
3.  **IMPORTANTE:** Non cancellare i file `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `nginx.conf` e la cartella `server` (con il suo `.env`!).

### Risoluzione Problemi
*   **Errore "Port already in use":** Qualcosa occupa la porta 80 o 3001. Chiudi Skype, altri server web o app simili.
*   **Errore "Network Error" nel sito:** Controlla i log del backend nella dashboard. Forse manca la chiave OpenAI nel file `.env`?
