在multi agent的时候， 如果是使用agentworkflow， 需要修改下它原始的handoff提示词

```python
HANDOFF_PROMPT = """Useful for handing off control to another agent.
If you determine that another agent is better equipped or specialized to fulfill the user's request more effectively, confidently hand off control to that agent to ensure the best outcome.

Currently available agents:
{agent_info}
"""
```

同时你的agent的描述的提示词要第一行要只有名字

```python
VALIDATE_PARAMETERS_PROMPT= """You are the ParameterValidationAgent. 
Your task is to use the validate_parameters tool to check the input. 
If validation fails (status == 'failed'), return the error and do not hand off. 
If validation succeeds, store the validated_params in context and should hand off control to the OpenAPIExtractionAgent.
"""
```

React agent最好是单agent+multi tool来使用，不能使用agentworkflow, agentworkflow里面都是functionagent