(function() {
  'use strict';

  // ── Skill Terminal (man page) ─────────────────────────────────────
  const SKILL_DATA = {
    "C#": { synopsis: "Primary language · 5+ years daily", usage: "All backend services, APIs, shared libraries, Azure Functions", where: "Siemens, IndiaLends, Telebu", see: "ASP.NET Core, .NET Core, LINQ" },
    "SQL": { synopsis: "Query language for relational databases", usage: "Stored procedures, query optimization, migrations, reporting", where: "All companies — SQL Server primary", see: "T-SQL, Dapper, EF Core" },
    "JavaScript": { synopsis: "Frontend & scripting", usage: "jQuery UI components, Azure Function triggers, this portfolio", where: "IndiaLends (frontend), Siemens (DevExpress)", see: "jQuery, Vue.js" },
    "ASP.NET Core": { synopsis: "Web framework for .NET", usage: "REST APIs, Minimal APIs, MVC endpoints, middleware pipelines", where: "Siemens (dashboard satellite, P&S microservice)", see: "Minimal APIs, REST, OIDC" },
    ".NET Core": { synopsis: "Cross-platform runtime", usage: "All new services since 2022, shared libraries, container targets", where: "Siemens, IndiaLends", see: "ASP.NET Core, Docker" },
    "Minimal APIs": { synopsis: ".NET 8 lightweight API pattern", usage: "Dashboard satellite service, P&S microservice endpoints", where: "Siemens — new services", see: "ASP.NET Core, REST" },
    "REST": { synopsis: "API design pattern", usage: "All service interfaces — resource-oriented, versioned, documented", where: "All companies", see: "Swagger/OpenAPI, JSON" },
    "CQRS / MediatR": { synopsis: "Command/Query separation + mediator", usage: "P&S microservice — separate read/write models", where: "Siemens", see: "DDD, Clean Architecture" },
    "DDD": { synopsis: "Domain-Driven Design", usage: "Aggregate design, bounded contexts, ubiquitous language in P&S service", where: "Siemens (P&S microservice)", see: "Clean Architecture, CQRS" },
    "Clean Architecture": { synopsis: "Layered dependency inversion", usage: "Service structure: Domain → Application → Infrastructure → API", where: "Siemens — all new services", see: "DDD, CQRS / MediatR" },
    "Microservices": { synopsis: "Independently deployable services", usage: "Dashboard satellite (Strangler Fig), P&S service, credential service", where: "Siemens — platform modernisation", see: "Docker, REST, DDD" },
    "BDD": { synopsis: "Behaviour-Driven Development", usage: "SpecFlow/ReqnRoll scenarios, Given-When-Then test structure", where: "Siemens — all new services", see: "NUnit, SpecFlow, Moq" },
    "Azure Functions": { synopsis: "Serverless compute", usage: "HTTP triggers (webhooks), Queue/Blob/Timer triggers for async workflows", where: "IndiaLends — document processing, scheduled reports", see: "Service Bus, Blob Storage" },
    "Entity Framework": { synopsis: "ORM for .NET (EF6 legacy)", usage: "Existing monolith data access layer — 170+ project codebase", where: "Siemens (legacy platform)", see: "EF Core, Dapper, LINQ" },
    "EF Core": { synopsis: "Modern ORM for .NET Core", usage: "New service data layers, migrations, code-first models", where: "Siemens (new services)", see: "Dapper, LINQ, PostgreSQL" },
    "Dapper": { synopsis: "Micro-ORM — raw SQL performance", usage: "Replaced EF for dashboard — 3x faster queries via stored procs", where: "Siemens (dashboard optimization)", see: "T-SQL, SQL Server" },
    "LINQ": { synopsis: "Language-integrated query", usage: "Collection transformations, EF queries, data pipeline operations", where: "All companies", see: "EF Core, C#" },
    "T-SQL": { synopsis: "SQL Server dialect", usage: "Stored procedures, views, performance tuning, index optimization", where: "Siemens, IndiaLends", see: "SQL Server, Dapper" },
    "SQL Server": { synopsis: "Primary relational database", usage: "Multi-tenant schemas, stored procs, maintenance jobs, Always On AG", where: "Siemens, IndiaLends", see: "T-SQL, Dapper, EF Core" },
    "PostgreSQL": { synopsis: "Open-source relational DB", usage: "New microservice data stores, container-friendly deployments", where: "Siemens (new services)", see: "EF Core, Docker" },
    "Redis": { synopsis: "In-memory cache / data store", usage: "Session caching, credential caching (shared library), distributed lock", where: "Siemens (shared NuGet library)", see: "AWS Secrets Manager, Resiliency" },
    "Azure App Service": { synopsis: "PaaS web hosting", usage: "Production deployment target for monolith and satellites", where: "Siemens, IndiaLends", see: "Docker, Azure DevOps" },
    "Service Bus": { synopsis: "Enterprise message broker", usage: "Async event-driven workflows, decoupled service communication", where: "IndiaLends (financial workflows)", see: "Azure Functions, Queue triggers" },
    "Blob Storage": { synopsis: "Azure object storage", usage: "Document storage, report generation output, file upload handling", where: "IndiaLends", see: "Azure Functions" },
    "AWS Secrets Manager": { synopsis: "Cloud secret management", usage: "Secure DB credential resolution, region-aware rotation in shared library", where: "Siemens (container migration)", see: "Redis, Resiliency Patterns" },
    "Docker": { synopsis: "Container runtime", usage: "Local dev environments, Linux container targets for platform migration", where: "Siemens (Windows→Linux migration)", see: "Microservices, .NET Core" },
    "OIDC / OAuth2": { synopsis: "Auth protocol standards", usage: "Enterprise SSO integration, token validation middleware", where: "Siemens (Auth0 ecosystem)", see: "JWT, Auth0, Cookie Auth" },
    "JWT": { synopsis: "JSON Web Tokens", usage: "API authentication, claims-based authorization, token refresh flows", where: "Siemens, IndiaLends", see: "OIDC, Auth0" },
    "Auth0": { synopsis: "Identity platform", usage: "Centralised auth service, tenant isolation, session management", where: "Siemens", see: "OIDC, JWT" },
    "VAPT Remediation": { synopsis: "Vulnerability & Penetration Testing fixes", usage: "Remediated findings from security assessments — XSS, CSRF, injection", where: "IndiaLends", see: "Auth, Security" },
    "Azure DevOps": { synopsis: "CI/CD + project management", usage: "Build pipelines, release gates, Azure Repos, work items", where: "IndiaLends, Siemens (boards)", see: "Jenkins, TeamCity" },
    "Jenkins": { synopsis: "CI/CD automation server", usage: "Production release pipelines, automated testing gates", where: "Siemens", see: "TeamCity, SonarQube" },
    "TeamCity": { synopsis: "JetBrains CI/CD", usage: "Build configurations, NuGet package publishing to MyGet", where: "Siemens", see: "Jenkins, MyGet" },
    "SonarQube": { synopsis: "Static code analysis", usage: "Code quality gates — coverage, duplication, complexity, vulnerabilities", where: "Siemens (CI pipeline)", see: "Snyk, Jenkins" },
    "Snyk": { synopsis: "Dependency vulnerability scanning", usage: "NuGet package security, container image scanning in CI", where: "Siemens", see: "SonarQube, Docker" },
    "Grafana": { synopsis: "Observability dashboards", usage: "Production monitoring — API latency, error rates, resource usage", where: "Siemens (production)", see: "Datadog" },
    "Datadog": { synopsis: "APM & monitoring platform", usage: "Distributed tracing, log aggregation, alerting on production issues", where: "Siemens", see: "Grafana" },
    "NUnit": { synopsis: "Unit testing framework", usage: "All unit + integration tests, parameterized test cases", where: "Siemens", see: "Moq, SpecFlow" },
    "SpecFlow": { synopsis: "BDD framework for .NET", usage: "Given-When-Then feature files, stakeholder-readable test specs", where: "Siemens", see: "ReqnRoll, NUnit" },
    "ReqnRoll": { synopsis: "SpecFlow successor (OSS)", usage: "Migration from SpecFlow, new BDD scenarios post-2024", where: "Siemens (new services)", see: "SpecFlow, NUnit" },
    "Moq": { synopsis: "Mocking framework", usage: "Dependency isolation in unit tests, verify interactions", where: "Siemens", see: "NUnit, BDD" },
  };

  document.querySelectorAll('.skill-tag').forEach(tag => {
    tag.style.cursor = 'pointer';
    tag.addEventListener('click', () => {
      // Deselect all, select this
      document.querySelectorAll('.skill-tag.selected').forEach(t => t.classList.remove('selected'));
      tag.classList.add('selected');
      bumpRequest('GET');
      // strip any injected lat-tip text before looking up
      const name = [...tag.childNodes]
        .filter(n => n.nodeType === Node.TEXT_NODE)
        .map(n => n.textContent).join('').trim();
      const data = SKILL_DATA[name];
      const terminal = document.getElementById('skill-terminal');
      const title = document.getElementById('skill-terminal-title');
      const body = document.getElementById('skill-terminal-body');

      if (!data) {
        title.textContent = `$ man ${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        body.innerHTML = `<span class="man-dim">No manual entry for ${name}</span>`;
        terminal.classList.add('active');
        return;
      }

      title.textContent = `$ man ${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      body.innerHTML = `
        <div class="man-section">
          <div class="man-heading">NAME</div>
          <div class="man-content">${name}</div>
        </div>
        <div class="man-section">
          <div class="man-heading">SYNOPSIS</div>
          <div class="man-content">${data.synopsis}</div>
        </div>
        <div class="man-section">
          <div class="man-heading">USAGE</div>
          <div class="man-content man-content--gold">${data.usage}</div>
        </div>
        <div class="man-section">
          <div class="man-heading">WHERE</div>
          <div class="man-content man-content--green">${data.where}</div>
        </div>
        <div class="man-section">
          <div class="man-heading">SEE ALSO</div>
          <div class="man-content man-ref">${data.see}</div>
        </div>
      `;
      terminal.classList.add('active');
      terminal.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });

})();
