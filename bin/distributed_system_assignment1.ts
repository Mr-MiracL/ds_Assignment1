#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DistributedSystemAssignment1Stack } from '../lib/distributed_system_assignment1-stack';

const app = new cdk.App();
new DistributedSystemAssignment1Stack (app, 'DsAssignment1Stack', {env: {region: 'eu-west-1'}});