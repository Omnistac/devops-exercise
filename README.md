# Trumid DevOps Exercise

Welcome to the Trumid DevOps Exercise! We're excited to have you here and look forward to seeing your solution.

This repository contains a monorepo structure with several services and shared modules. Your challenge is to explore, understand, and optimize the deployment and orchestration of these components.

## 🎯 Purpose

This exercise is designed to help us understand how you:
- Approach and analyze complex/unknown systems
- Think about deployment strategies and orchestration
- Optimize workflows for efficiency
- Implement DevOps best practices

## 🚀 Getting Started

### Prerequisites

- Node.js (v20+)
- pnpm (v10+)

### Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd devops-exercise
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build all packages:
   ```bash
   pnpm build
   ```

4. Run tests:
   ```bash
   pnpm test
   ```

## 📁 Project Structure

```
devops-exercise/
│
├── common/               # Shared modules used across services
│   ├── health/           # Health check module (readiness & liveness probes)
│   └── logger/           # Logging module
│
├── devops/               # devops scripts
│   ├── integrations/     # Integration tests
│   └── maintenance/      # Maintenance scripts
│
├── services/             # Microservices
│   ├── user/             # User management service
│   └── trading/          # Trading and stock management service
│
└── pnpm-workspace.yaml   # Workspace definition for monorepo
```





### Common Modules

- **health**: Provides standardized health check endpoints (/readiness and /liveness) used by all services for Kubernetes readiness and liveness probes.
  
- **logger**: A centralized logging module that adds consistent formatting, timestamps, and process IDs to log messages across all services.

### Services

- **user**: A service that manages user data, stored in a JSON file. Provides endpoints to retrieve user information.

- **trading**: A service for stock trading operations. Manages stocks and ownership, allowing users to swap ownership of stocks between them.

### DevOps Modules

- **integrations**: A module for database/kafka/s3 integrations

- **maintenance**: A module for maintenance scripts/orchestration.

## 🔍 Important Considerations

- This is an exercise to evaluate how you program, think about problems, and design solutions. During the exercise, it is okay to ask questions, and make assumptions.

- The "sleep" commands throughout the codebase represent long-running asynchronous processes in a real-world scenario. They are intentionally included to simulate operations that take time to complete.

- Focus on orchestration and efficiency, not on modifying the actual code of the services or common libraries. Your task is to develop strategies for deploying, managing, and optimizing these services rather than changing their internal implementations.

- Consider scalability, reliability, and maintainability in your solutions. How would these services operate in a cloud environment? How would you handle different deployment scenarios?

## Mock Pipeline

The CI pipeline is typically ran through GitHub Actions, depending on your preference, you may run it via GitHub Actions or Locally based on the bash scripts in the `devops` folder.

```bash
# run a CI pipeline
./pipeline.sh ci

# run a CD pipeline
./pipeline.sh cd
```

## ❓ Problems


## **Problem 1 (15 min) - CI is getting Slow**

The developers at ACME corp are starting to grumble about how slow CI is becoming. Each PR is beginning to take longer and longer, and they're starting to get impatient.

You've been tasked with figuring out what's slowing down the CI pipeline and how to optimize it.

You can run the CI "pipeline" with the following command:

```bash
./pipeline.sh ci 
```

> [!NOTE]
> As a reminder, we're focused on the CI/CD Pipeline, and not the actual implementation of the services. 

> [!NOTE]
> pnpm has quite a few filtering features, the docs are [here](https://pnpm.io/filtering)

    
## **Problem 2 (15 min) - The User Service Tests are Flaky!**

The developers at ACME corp are noticing that the User Service tests are flaky. They are failing around 25% of the time, resulting in a re-run of the pipeline.

Investigate if the pipeline can be improved, to handle this use case.

Again - you can run the pipeline with the following command:

```bash
./pipeline.sh ci 
```

Run it a few times to detect the flakiness, and recommend a solution.

> [!NOTE]
> As a reminder, we're focused on the CI/CD Pipeline, and not the actual implementation of the services. 


## **Problem 3 (15 min) - Maintenance is getting slow!**

The production operations team at ACME corp has to run a suite of scripts to perform "maintenance" on the platform. The maintenance script is a TypeScript project that runs database, kafka and S3 cleanup.

It is ran with:
```bash
pnpm -F maintenance maintenance --help
```

However, of late the process has started to take a long time, and even worse, become flaky! When this task fails, the production operations team has to run it again with the `--cleanup` flag causing it to take even longer! 

You are tasked with investigating the pipeline and refactoring it to complete faster, and improve error handling.

The following commands may be helpful in your investigation:

```
pnpm -F maintenance maintenance --verbose
pnpm -F maintenance maintenance --cleanup
pnpm -F maintenance test
pnpm -F maintenance coverage
```
