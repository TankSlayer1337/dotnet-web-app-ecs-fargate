import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, 'DefaultVPC', {
      isDefault: true
    });

    const securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc,
      description: 'Fargate Demo Security Group',
      allowAllOutbound: true
    });
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP traffic from anywhere'
    );

    const loadBalancedFargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'Service', {
      vpc,
      securityGroups: [ securityGroup ],
      cpu: 256,
      memoryLimitMiB: 512,
      desiredCount: 1,
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset('../src'),
        containerPort: 8080
      },
      publicLoadBalancer: true,
      assignPublicIp: true
    });

    loadBalancedFargateService.targetGroup.configureHealthCheck({
      path: "/WeatherForecast",
    });

    new cdk.CfnOutput(this, 'WeatherForecastURL', {
      value: 'http://' + loadBalancedFargateService.loadBalancer.loadBalancerDnsName + '/WeatherForecast'
    });
  }
}
