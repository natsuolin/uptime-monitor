# 📈 UptimePulse | Micro-SaaS Link & Uptime Monitor

**UptimePulse** is a lightweight, self-hosted Micro-SaaS application designed to monitor the availability (uptime) and latency of web services in real-time. The system automates routine health checks, logs network latency variations, and dispatches rich payload notifications via Webhooks the exact millisecond a downtime event is captured.

Built specifically for developers who want a production-grade, zero-overhead dashboard to keep track of their web infrastructure.

---

## 🚀 Key Features

- **Interactive Dashboard:** A clean, modern UI built with Bootstrap 5 showcasing site health status (Online/Offline), latency in milliseconds, and human-readable timestamps for the latest checks.
- **Synchronized Countdown Timer:** An intelligent client-side timer synchronized with the system's clock, dynamically predicting when the next backend cron cycle will trigger.
- **Background Worker (Cron Jobs):** Concurrently processes asynchronous HTTP validation routines in the background every single minute using `node-cron`.
- **Event-Driven Rich Webhooks:** Native integration built for Discord/Telegram, pushing data-dense embeds containing error diagnostics, current latency, and recent availability trends.
- **Audit Logs & Historical Data:** Interactive modal views enabling deep-dive inspection of the latest 10 health logs to easily spot intermittent network jitter or SLA drops.
- **Zero-Setup Database Architecture:** Powered by an embedded SQLite instance that self-provisions and builds its schema tables automatically on the first API boot up.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Bootstrap 5 (Components & Modals), Bootstrap Icons.
- **Backend:** Node.js, Express.js (RESTful Architecture).
- **Database:** SQLite (via native `sqlite3` driver).
- **Automation & Network:** Node-Cron (Background Processes) and Axios (Optimized HTTP HEAD/GET request fallbacks).

---

## 📂 Project Architecture

The repository enforces a clean separation of concerns (SoC), structured as follows:

```text
uptime-monitor/
├── src/
│   ├── config/
│   │   └── database.js    # SQLite connection wrapper & auto-migration schema
│   ├── cron/
│   │   └── monitorJob.js  # Concurrent background checker & Webhook delivery logic
│   ├── routes/
│   │   └── api.js         # REST endpoints (Sites CRUD & historical log queries)
│   └── server.js          # Main bootloader for Express app and cron workers
├── views/
│   └── index.html         # Single Page Application (SPA) dashboard UI
├── package.json
└── .gitignore
🔧 Installation & SetupPrerequisitesNode.js (v18.0.0 or higher) installed on your environment.Getting StartedClone this repository to your local machine:Bashgit clone [https://github.com/natsuolin/uptime-monitor.git](https://github.com/natsuolin/uptime-monitor.git)
Navigate into the root project directory:Bashcd uptime-monitor
Install the application dependencies:Bashnpm install
Boot up the server:Bashnpm start
Access the interactive web dashboard:Plaintexthttp://localhost:3000
(Note: The database.sqlite file will automatically compile on the project root upon your first launch).🔌 API Endpoints (For Third-Party Integrations)If you prefer interacting with your monitor programmatically via Postman, Insomnia, or cURL, the backend exposes the following RESTful endpoints:MethodEndpointDescriptionGET/api/sitesFetches all tracked hosts alongside their current status and latest response times.POST/api/sitesRegisters a new target host. Payload schema: {"name", "url", "webhook_url"}.DELETE/api/sites/:idRemoves a site and cascades deletion across all its history logs.GET/api/sites/:id/logsReturns a JSON array containing the last 10 audit logs for a specific site ID.🤝 ContributingContributions make the open-source community an amazing place to learn and build. Feel free to pitch in!  Fork the Project  Create your Feature Branch (git checkout -b feature/AmazingFeature)  Commit your Changes (git commit -m 'add: some amazing feature')  Push to the Branch (git push origin feature/AmazingFeature)Open a Pull Request📝 LicenseDistributed under the MIT License. See LICENSE for more information.📬 Contact & SupportNatsuo Lin — Systems Analyst & Full-Stack DeveloperEmail: natsuolin@proton.meGitHub: @natsuolinIf you found this project helpful, feel free to drop a ⭐️ on the repository!
