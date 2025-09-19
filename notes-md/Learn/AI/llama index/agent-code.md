```python
import json
import asyncio

from llama_index.llms.azure_openai import AzureOpenAI
from llama_index.core.agent.workflow import FunctionAgent, ReActAgent
from llama_index.core.agent.workflow import (
    AgentInput,
    AgentOutput,
    ToolCall,
    ToolCallResult,
    AgentStream,
    AgentWorkflow
)

import tools
import prompts_template


def init_llm():
    azure_endpoint = "https://a1a-52048-dev-cog-rioai-eus2-1.openai.azure.com/"
    deployment = "gpt-4.1_2025-04-14"
    model_name = "gpt-4.1"
    # api_key = os.getenv("AZURE_OPENAI_API_KEY") # need set this env
    api_key = "" # need set this env
    api_version = "2025-03-01-preview"
    openai_llm = AzureOpenAI(
        model=model_name,
        deployment_name=deployment,
        api_key=api_key,
        azure_endpoint=azure_endpoint,
        api_version=api_version
    )
    return openai_llm

llm = init_llm()

parameter_validation_agent = FunctionAgent(
    name="ParameterValidationAgent",
    description="Useful for validating parameters for the user input.",
    system_prompt=prompts_template.VALIDATE_PARAMETERS_PROMPT,
    llm=llm,
    tools=tools.ParameterValidationToolSpec().to_tool_list(),
    can_handoff_to=["OpenAPIExtractionAgent"]
)

openapi_extraction_agent = FunctionAgent(
    name="OpenAPIExtractionAgent",
    description="Useful for extracting information from OpenAPI specifications.",
    system_prompt=prompts_template.OPENAPI_EXTRACTION_PROMPT,
    llm=llm,
    tools=tools.OpenAPIToolSpec().to_tool_list() + tools.FileOperatorToolSpec().to_tool_list(),
    can_handoff_to=["OpenAPIReviewAgent"],
)

openapi_review_agent = FunctionAgent(
    name="OpenAPIReviewAgent",
    description="Useful for reviewing OpenAPI specifications.",
    system_prompt=prompts_template.OPENAPI_REVIEW_PROMPT,
    llm=llm,
    tools=tools.FileOperatorToolSpec().to_tool_list(),
    can_handoff_to=["OpenAPIExtractionAgent","RequestCheckpointAgent"],
)

request_checkpoint_agent = FunctionAgent(
    name="RequestCheckpointAgent",
    description="Useful for generating request checkpoints.",
    system_prompt=prompts_template.REQUEST_CHECKPOINT_PROMPT,
    llm=llm,
    tools=tools.FileOperatorToolSpec().to_tool_list(),
    can_handoff_to=["RequestCheckpointReviewAgent"],
)

request_checkpoint_review_agent = FunctionAgent(
    name="RequestCheckpointReviewAgent",
    description="Useful for reviewing request checkpoints.",
    system_prompt=prompts_template.REQUEST_CHECKPOINT_REVIEW_PROMPT,
    llm=llm,
    tools=tools.FileOperatorToolSpec().to_tool_list(),
    can_handoff_to=["RequestCheckpointAgent", "RequestInvalidateBodyAgent"],
)

request_invalidate_body_agent = FunctionAgent(
    name="RequestInvalidateBodyAgent",
    description="Useful for generating invalid request bodies.",
    system_prompt=prompts_template.REQUEST_INVALIDATE_BODY_PROMPT,
    llm=llm,
    tools=tools.FileOperatorToolSpec().to_tool_list() + tools.CodeInterpreterToolSpec().to_tool_list(),
    can_handoff_to=["RequestInvalidateBodyReviewAgent"],
)

request_invalidate_body_review_agent = FunctionAgent(
    name="RequestInvalidateBodyReviewAgent",
    description="Useful for reviewing invalid request bodies.",
    system_prompt=prompts_template.REQUEST_INVALIDATE_BODY_REVIEW_PROMPT,
    llm=llm,
    tools=tools.FileOperatorToolSpec().to_tool_list() + tools.CodeInterpreterToolSpec().to_tool_list(),
    can_handoff_to=["RequestInvalidateBodyReviewAgent", "RequestValidateBodyAgent"],
)

request_validate_body_agent = FunctionAgent(
    name="RequestValidateBodyAgent",
    description="Useful for validating request bodies.",
    system_prompt=prompts_template.REQUEST_VALIDATE_BODY_PROMPT,
    llm=llm,
    tools=tools.FileOperatorToolSpec().to_tool_list() + tools.CodeInterpreterToolSpec().to_tool_list(),
    can_handoff_to=["RequestValidateBodyReviewAgent"],
)

request_validate_body_review_agent = FunctionAgent(
    name="RequestValidateBodyReviewAgent",
    description="Useful for reviewing request bodies.",
    system_prompt=prompts_template.REQUEST_VALIDATE_BODY_REVIEW_PROMPT,
    llm=llm,
    tools=tools.FileOperatorToolSpec().to_tool_list() + tools.CodeInterpreterToolSpec().to_tool_list(),
    can_handoff_to=["RequestValidateBodyReviewAgent", "RequestBodyMergeAgent"],
)

request_body_merge_agent = FunctionAgent(
    name="RequestBodyMergeAgent",
    description="Useful for merging request bodies.",
    system_prompt=prompts_template.REQUEST_BODY_MERGE_PROMPT,
    llm=llm,
    tools=tools.FileOperatorToolSpec().to_tool_list() + tools.CodeInterpreterToolSpec().to_tool_list()
)



agent_workflow = AgentWorkflow(
    agents=[
        parameter_validation_agent,
        openapi_extraction_agent,
        openapi_review_agent,
        request_checkpoint_agent,
        request_checkpoint_review_agent,
        request_invalidate_body_agent,
        request_invalidate_body_review_agent,
        request_validate_body_agent,
        request_validate_body_review_agent,
        request_body_merge_agent
    ],
    handoff_prompt=prompts_template.HANDOFF_PROMPT,
    root_agent=parameter_validation_agent.name,
    initial_state={
        "openapi_review_retry_count": 0,
        "request_checkpoint_review_retry_count": 0,
        "request_invalidate_body_review_retry_count": 0,
        "request_validate_body_review_retry_count": 0
    }
)

#
# draw_all_possible_flows(agent_workflow, filename="some_filename.html")
#
input_data = {
    "openapi_filter_file_path": "files/swagger/openapi_filter.txt",
    "swagger_file_path": "files/swagger/LFAIrSwap_V1.yaml",
    "request_body_example_path": "files/request_body/LFAIrSwap_POST_Value_VanillaSwap_AccrualDayCount_Dcb30360_DcbActual365_RB.json",
}

async def main():
    handler = agent_workflow.run(user_msg=json.dumps(input_data))
    current_agent = None
    current_tool_calls = ""
    async for event in handler.stream_events():
        if (
                hasattr(event, "current_agent_name")
                and event.current_agent_name != current_agent
        ):
            current_agent = event.current_agent_name
            print(f"\n{'=' * 50}")
            print(f"🤖 Agent: {current_agent}")
            print(f"{'=' * 50}\n")

        # if isinstance(event, AgentStream):
        #     if event.delta:
        #         print(event.delta, end="", flush=True)
        # elif isinstance(event, AgentInput):
        #     print("📥 Input:", event.input)
        elif isinstance(event, AgentOutput):
            if event.response.content:
                print("📤 Output:", event.response.content)
            if event.tool_calls:
                print(
                    "🛠️  Planning to use tools:",
                    [call.tool_name for call in event.tool_calls],
                )
        elif isinstance(event, ToolCallResult):
            print(f"🔧 Tool Result ({event.tool_name}):")
            print(f"  Arguments: {event.tool_kwargs}")
            print(f"  Output: {event.tool_output}")
        elif isinstance(event, ToolCall):
            print(f"🔨 Calling Tool: {event.tool_name}")
            print(f"  With arguments: {event.tool_kwargs}")

if __name__ == "__main__":
    asyncio.run(main())


```