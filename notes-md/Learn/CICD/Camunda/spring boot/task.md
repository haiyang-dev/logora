```
package com.example.camunda.test.tasks;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;

import java.util.logging.Logger;

public class OfferLoan implements JavaDelegate {
    private final static Logger LOGGER = Logger.getLogger("OfferLoan");

    @Override
    public void execute(DelegateExecution execution) {
        LOGGER.info("offer " + execution.getVariable("lenderId") + ", loans " + execution.getVariable("amount"));
    }
}
```

接收的参数在execution里面，如果下面还有task、gateway， 那么可以通过setvariables继续传参数，如果失败则抛出异常！

```
if (shouldFailVarName) {
  throw new RuntimeException("Service invocation failure!");

} else {
  execution.setVariable(PRICE_VAR_NAME, PRICE);

}
```