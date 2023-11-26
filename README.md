# dotnet-web-app-ecs-fargate
Example project showing how to host ASP.NET Core web app on ECS using Fargate.

## Overview
This project showcases how to relatively easily setup an ASP.NET Core 6 Web API to be hosted on AWS using Amazon Elastic Container Service (ECS) with the Fargate launch type. The AWS Cloud Development Kit (CDK) is used for defining the infrastructure in AWS.  

This document lists the steps and configurations taken to produce this project.

## Reproduce this Project - Step by Step
Prerequisites: [Docker Desktop](https://www.docker.com/products/docker-desktop/), [AWS CDK Toolkit](https://docs.aws.amazon.com/cdk/v2/guide/cli.html), Visual Studio, locally configured AWS credentials, a CDK Bootstrapped environment (in this project, eu-north-1 Stockholm is used).

1. Create GitHub repository with [Visual Studio gitignore](https://github.com/github/gitignore/blob/main/VisualStudio.gitignore) and README.

2. Create infra directory. Run `cdk init app --language=typescript` in the infra directory.

3. Update [infra.ts](infra/bin/infra.ts) and [infra-stack.ts](infra/lib/infra-stack.ts) to be as in this project.

4. Create src directory. Inside of the src directory, create a new ASP.NET Core project using Visual Studio. Here, the ASP.NET Core Web API template was used. Make sure to deselect the "Configure for HTTPS" option. This creates the classic WeatherApp.

5. In the src directory, run `docker init`. Follow the prompts.

6. The created Dockerfile will make it so that the app will run under a non-privileged user, i.e. a non-root user. This comes with [limitations](https://docs.docker.com/engine/security/rootless/#known-limitations), one of which is available ports. The ASP.NET Core 6 official image makes the app listen to port 80 by default, which is a privileged port and not allowed to use for a non-root user. All ports < 1024 are priviliged.  
To change this, [Program.cs](src/WeatherApp/WeatherApp/Program.cs) in the WeatherApp can be updated so that the Kestrel server listens on another port, e.g. 8080. [infra-stack.ts](infra/lib/infra-stack.ts) also needs to be updated (line 34) since the default containerPort in the taskImageOptions is 80.  
If you want to be able to use the [compose.yaml](compose.yaml) file created during docker init to test running the container locally (by running `docker compose up --build` in the src directory), the container port in this file needs to be updated as well. In this project, both host and container ports has been set to 8080.  
For official ASP.NET Core images, starting with .NET 8, the app will be configured to listen on port 8080 by default: [link](From https://hub.docker.com/_/microsoft-dotnet-samples/).

## Deployment
After having followed the project setup steps (or simply having cloned this repository), the application can be deployed. To deploy the app using CDK, move into the infra directory and run `cdk deploy --all`. Enter y when prompted. The deployment can take some time.  
When the deployment is done, among the Outputs the WeatherForecastURL will be listed. Open the link to verify that the app generates a weather forecast response.  

## Cleanup
To clean up, either delete the created cloudformation stack in the AWS console, or run `cdk destroy --all` while inside the infra directory and enter y when prompted.