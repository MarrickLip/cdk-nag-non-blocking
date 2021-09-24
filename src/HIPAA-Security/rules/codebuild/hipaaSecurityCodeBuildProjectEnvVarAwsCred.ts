/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnProject } from '@aws-cdk/aws-codebuild';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * CodeBuild projects do not store AWS credentials as plaintext environment variables - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnProject) {
    //Check for the presence of OAUTH
    const environment = Stack.of(node).resolve(node.environment);
    const environmentVars = Stack.of(node).resolve(
      environment.environmentVariables
    );
    if (environmentVars != undefined) {
      //For each envvar, check if its a sensitive credential being stored
      for (const envVar of environmentVars) {
        const resolvedEnvVar = Stack.of(node).resolve(envVar);
        if (
          resolvedEnvVar.name == 'AWS_ACCESS_KEY_ID' ||
          resolvedEnvVar.name == 'AWS_SECRET_ACCESS_KEY'
        ) {
          //is this credential being stored as plaintext?
          if (
            resolvedEnvVar.type == undefined ||
            resolvedEnvVar.type == 'PLAINTEXT'
          ) {
            return false;
          }
        }
      }
    }
  }
  return true;
}