import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');
import s3 = require('@aws-cdk/aws-s3');
import {BucketAccessControl, HttpMethods} from '@aws-cdk/aws-s3';
import {LambdaDestination} from '@aws-cdk/aws-s3-notifications';
import {Duration} from "@aws-cdk/core";

export class AwsLambdaStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //람다 레이어 작성 방법.
    //name 속성들은 패턴이 존재한다.  pattern: (arn:[a-zA-Z0-9-]+:lambda:[a-zA-Z0-9-]+:\d{12}:layer:[a-zA-Z0-9-_]+)|[a-zA-Z0-9-_] )
    // const imageLayers = new lambda.LayerVersion(this, "imageLayers",{
    //   code : new lambda.AssetCode('lambda_layers/image_layers'),
    //   compatibleRuntimes : [lambda.Runtime.NODEJS_10_X, lambda.Runtime.NODEJS_8_10],
    //   layerVersionName: 'imageThumnailLayers',
    //   description : 'jpg/png/jpeg thumnail modules'
    // });
    //
    // const mp4Layers = new lambda.LayerVersion(this, "mp4Layers",{
    //   code : new lambda.AssetCode('lambda_layers/image_layers'),
    //   compatibleRuntimes : [lambda.Runtime.NODEJS_10_X, lambda.Runtime.NODEJS_8_10],
    //   layerVersionName: 'mp4Thumnail',
    //   description : 'mp4/gif Thumnail'
    // });

    const tunmnailLambda = new lambda.Function(this, "s3ImageLambda", {
      code: new lambda.AssetCode('lambdas/imageThumnail'),
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: 's3_image_lambda.handler',
      // 레이어 등록
      // layers : [imageLayers]
    });

    const gifLambda = new lambda.Function(this, "gifLambda", {
      code: new lambda.AssetCode('lambdas/gifToMp4'),
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: 'gifToMp4Lambda_test.handler',
      timeout: Duration.minutes(2)
    });

    const thumnailBucket = new s3.Bucket(this, 'thumBucket', {
      bucketName: 'lambda-test-resized',
      versioned: true,
      // 모든 Get은 public 접근 설정
      // publicReadAccess:true,
      accessControl: BucketAccessControl.AUTHENTICATED_READ
    });

    thumnailBucket.grantWrite(tunmnailLambda);
    thumnailBucket.grantWrite(gifLambda);

    thumnailBucket.addCorsRule({
      allowedOrigins: ['*'],
      allowedMethods: [HttpMethods.GET, HttpMethods.POST,HttpMethods.PUT, HttpMethods.HEAD ],
      allowedHeaders: ['*']
    });

    const bucket = new s3.Bucket(this, 'Bucket', {
      bucketName: 'lambda-test-shin',
      versioned: true,
    });

    bucket.grantRead(tunmnailLambda);
    bucket.grantReadWrite(gifLambda);

    bucket.addCorsRule({
      allowedOrigins: ['*'],
      allowedMethods: [HttpMethods.GET, HttpMethods.POST,HttpMethods.PUT, HttpMethods.HEAD ],
      allowedHeaders: ['*']
    });

    bucket.addEventNotification(s3.EventType.OBJECT_CREATED,
        new LambdaDestination(tunmnailLambda),
        { prefix: 'origin/', suffix : '.jpg' } );

    bucket.addEventNotification(s3.EventType.OBJECT_CREATED,
        new LambdaDestination(tunmnailLambda),
        { prefix: 'origin/', suffix : '.png' } );

    bucket.addEventNotification(s3.EventType.OBJECT_CREATED,
        new LambdaDestination(tunmnailLambda),
        { prefix: 'origin/', suffix : '.jpeg' } );

    bucket.addEventNotification(s3.EventType.OBJECT_CREATED,
        new LambdaDestination(gifLambda),
        { prefix: 'origin/', suffix : '.gif' } );
  }
}
