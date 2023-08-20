
import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { HitCounter } from '../lib/constructs/hitcounter';
import { Template, Capture  } from 'aws-cdk-lib/assertions';

test('DynamoDb Table Created', () => { 

	const stack = new cdk.Stack();

	new HitCounter(stack, 'TestHitCounter', {
		downstream: new lambda.Function(stack, 'TestFunction', {			
			runtime: lambda.Runtime.NODEJS_14_X,
			handler: 'hello.handler',
			code: lambda.Code.fromAsset('lambda'),

		})
	})

	const template = Template.fromStack(stack);
	template.resourceCountIs("AWS::DynamoDB::Table", 1);

})

test('Lambda Has Environment Variables', () =>{ 
	const stack = new cdk.Stack();
	new HitCounter(stack, 'MyTestConstruct', {
    downstream:  new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'hello.handler',
      code: lambda.Code.fromAsset('lambda')
    })
  });
  // THEN
	const template = Template.fromStack(stack);
	const envCapture = new Capture();

	template.hasResourceProperties("AWS::Lambda::Function", {
		Environment: envCapture,

	})

	expect(envCapture.asObject()).toEqual(
    {
      Variables: {
        DOWNSTREAM_FUNCTION_NAME: {
          Ref: "TestFunction22AD90FC",
        },
        HITS_TABLE_NAME: {
          Ref: "MyTestConstructHits24A357F0",
        },
      },
    }
  );



})

test('DynamoDB Table Created With Encryption', () => {
  const stack = new cdk.Stack();
  // WHEN
  new HitCounter(stack, 'MyTestConstruct', {
    downstream:  new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'hello.handler',
      code: lambda.Code.fromAsset('lambda')
    })
  });
  // THEN
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::DynamoDB::Table', {
    SSESpecification: {
      SSEEnabled: true
    }
  });
});
