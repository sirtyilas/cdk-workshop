import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs';

/**
 * 
 * Ubukho bale chap means creation of one or more resoucres depending on usage
 * As you can see lena counts how many time abethwe ngayo i function iyibhale kwi db lonto
 * we have a lamdbda function that tdoes the work for us here.
 * 
 */

export interface HitCounterProps { 

  downstream: lambda.IFunction;
  
  readCapacity?: number;
}

export class HitCounter extends Construct { 

  public readonly handler: lambda.Function;
  public readonly table: dynamodb.Table;


  constructor(scope: Construct, id: string, props: HitCounterProps) {
    
		if (props.readCapacity !== undefined && (props.readCapacity < 5 || props.readCapacity > 20)) {
      throw new Error('readCapacity must be greater than 5 and less than 20');
    }

    console.log(props.readCapacity);
    
		super(scope, id);

    
    const table = new dynamodb.Table(this, 'Hits', {
      partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      readCapacity : props.readCapacity ?? 5
      
    });
    
    this.table = table;

    this.handler = new lambda.Function(this, 'HitCounterHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'hitcounter.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
          DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
          HITS_TABLE_NAME: table.tableName
      }
    });
    
    table.grantReadWriteData(this.handler)
    props.downstream.grantInvoke(this.handler)
		
	}

}