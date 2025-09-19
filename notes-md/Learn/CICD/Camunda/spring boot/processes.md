spring启动直接跑process

```
package com.example.camunda.test.processes;

import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.spring.boot.starter.event.PostDeployEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class LoanApproval {
    @Autowired
    private RuntimeService runtimeService;

    @EventListener
    private void processPostDeploy(PostDeployEvent event) {
        Map<String,Object> variables = new HashMap<String,Object>();
        variables.put("lenderId", "test");
        variables.put("amount", "10000");
//
        ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("loan-approval", variables);
    }
}

```