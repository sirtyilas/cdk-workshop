import { Stack, StackProps } from 'aws-cdk-lib';
import * as lambda from  'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway'
import { HitCounter } from './constructs/hitcounter';
import { TableViewer } from 'cdk-dynamo-table-viewer';


export class CdkWorkshopStack extends Stack {

  
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    


    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,    // execution environment
      code: lambda.Code.fromAsset('lambda'),  // code loaded from "lambda" directory
      handler: 'hello.handler'
    })

    const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {
      downstream: hello
    });

    new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: helloWithCounter.handler
    })

    const tableView = new TableViewer(this, 'HitsViewer', {
      title: 'view hits',
      table: helloWithCounter.table,
      sortBy: '-path'

    })

  }

}
