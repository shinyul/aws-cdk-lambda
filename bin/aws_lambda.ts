#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import { AwsLambdaStack } from '../lib/aws_lambda-stack';

const app = new cdk.App();
new AwsLambdaStack(app, 'AwsLambdaStack');