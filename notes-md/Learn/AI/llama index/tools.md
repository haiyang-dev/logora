```python
import os
import subprocess
import sys
import json
from collections import OrderedDict
from typing import List, Callable

import yaml
from llama_index.core.schema import Document
from llama_index.core.tools.tool_spec.base import BaseToolSpec


class ParameterValidationToolSpec(BaseToolSpec):
    """ToolSpec for validating user input parameters"""

    spec_functions = ["validate_parameters"]

    def validate_parameters(self, openapi_filter_file_path: str, swagger_file_path: str,
                            request_body_example_path: str) -> dict:
        required_params = {
            "openapi_filter_file_path": openapi_filter_file_path,
            "swagger_file_path": swagger_file_path,
            "request_body_example_path": request_body_example_path
        }

        missing = [k for k, v in required_params.items() if not v]

        if missing:
            return {
                "status": "failed",
                "message": f"Validation failed. Missing or empty parameters: {', '.join(missing)}.",
                "stop": True
            }

        return {
            "status": "success",
            "message": "Validation successful.",
            "validated_params": required_params
        }


class FileOperatorToolSpec(BaseToolSpec):
    """
    File Operator tool spec.
    Provides functions to read and save files locally.
    """

    spec_functions = ["read_file", "save_file"]

    def read_file(self, file_path: str) -> str:
        """Read content from a local file given its path."""
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()

    def save_file(self, file_path: str, content: str) -> str:
        """Save content to a local file. Requires file_path and content."""
        # Create directory if it doesn't exist
        directory = os.path.dirname(file_path)
        if directory and not os.path.exists(directory):
            os.makedirs(directory)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return f"Content saved to {file_path}"


class CodeInterpreterToolSpec(BaseToolSpec):
    """
    Code Interpreter tool spec.

    WARNING: This tool provides the Agent access to the `subprocess.run` command.
    Arbitrary code execution is possible on the machine running this tool.
    This tool is not recommended to be used in a production setting, and would require heavy sandboxing or virtual machines

    """

    spec_functions = ["code_interpreter"]

    def code_interpreter(self, code: str):
        """
        A function to execute python code, and return the stdout and stderr.

        You should import any libraries that you wish to use. You have access to any libraries the user has installed.

        The code passed to this function is executed in isolation. It should be complete at the time it is passed to this function.

        You should interpret the output and errors returned from this function, and attempt to fix any problems.
        If you cannot fix the error, show the code to the user and ask for help

        It is not possible to return graphics or other complicated data from this function. If the user cannot see the output, save it to a file and tell the user.
        """
        result = subprocess.run([sys.executable, "-c", code], capture_output=True)
        return f"StdOut:\n{result.stdout}\nStdErr:\n{result.stderr}"


class OpenAPIToolSpec(BaseToolSpec):
    """
    OpenAPI Tool.

    This tool can be used to parse an OpenAPI spec for endpoints and operations
    Use the RequestsToolSpec to automate requests to the openapi server
    """

    spec_functions = ["load_openapi_spec", "load_endpoint_from_openapi"]

    def load_openapi_spec(self, openapi_file_path) -> List[Document]:
        """
        You are an AI agent specifically designed to retrieve information by making web requests to
        an API based on an OpenAPI specification, Requires openapi_file_path.

        Here's a step-by-step guide to assist you in answering questions:

        1. Determine the server base URL required for making the request

        2. Identify the relevant endpoint (a HTTP verb plus path template) necessary to address the
        question
        """
        with open(openapi_file_path, "r", encoding="utf-8") as f:
            openapi_spec = yaml.safe_load(f)

        if isinstance(openapi_spec, dict) and openapi_spec.get("openapi", "").startswith("3."):
            openapi_version = "3.0"
        else:
            openapi_version = "2.0"

        servers = []
        if openapi_version == "3.0" and "servers" in openapi_spec:
            for server in openapi_spec["servers"]:
                if "url" in server:
                    servers.append(server["url"])

        document_text = (
            f"OpenAPI Spec Version: {openapi_version}\n"
            f"Servers: {json.dumps(servers)}\n\n"
            f"Endpoints:\n\n"
        )

        if "paths" in openapi_spec:
            for path, path_item in OrderedDict(sorted(openapi_spec["paths"].items())).items():
                document_text += f"Path: {path}\n"

                operations = []
                for op in ["get", "put", "post", "delete", "options", "head", "patch", "trace"]:
                    if op in path_item:
                        operations.append((op, path_item[op]))

                for i, (method, operation) in enumerate(operations):
                    operation_id = operation.get("operationId", f"{method}_{path}")
                    summary = operation.get("summary", "")
                    description = operation.get("description", "")

                    document_text += f"  Operation: {method.upper()} {path}\n"
                    document_text += f"  OperationId: {operation_id}\n"
                    if summary:
                        document_text += f"  Summary: {summary}\n"
                    if description:
                        document_text += f"  Description: {description}\n"

                    # Parameters
                    parameters = []
                    if "parameters" in operation:
                        parameters.extend(operation["parameters"])
                    if "parameters" in path_item:
                        parameters.extend(path_item["parameters"])

                    for param in parameters:
                        if "$ref" in param:
                            param_ref = param["$ref"]
                            # we don't fully resolve references right now
                            document_text += f"    Parameter Reference: {param_ref}\n"
                        else:
                            param_name = param.get("name", "")
                            param_in = param.get("in", "")
                            param_required = "required" if param.get("required", False) else "optional"
                            param_schema_type = ""
                            param_schema = param.get("schema", {}) or {}
                            if param_schema:
                                if "$ref" in param_schema:
                                    param_schema_type = param_schema["$ref"]
                                elif "type" in param_schema:
                                    param_schema_type = param_schema["type"]
                            document_text += (
                                f"    Parameter: {param_name} in {param_in} ({param_required})"
                            )
                            if param_schema_type:
                                document_text += f" type: {param_schema_type}"
                            document_text += "\n"

                    document_text += "\n"

        return [Document(text=document_text)]

    def load_endpoint_from_openapi(self, openapi_file_path, target_path) -> List[Document]:
        """
        Extract and load a specific endpoint from an OpenAPI specification.
        This method is optimized for large OpenAPI files by focusing only on a specific endpoint.

        Args:
            openapi_file_path: Path to the OpenAPI specification file
            target_path: The specific API path to extract (e.g., "/financials/instruments/ir-swaps/v1/$value:")

        Returns:
            A list containing a single Document with the endpoint information
        """
        with open(openapi_file_path, "r", encoding="utf-8") as f:
            openapi_spec = yaml.safe_load(f)

        if isinstance(openapi_spec, dict) and openapi_spec.get("openapi", "").startswith("3."):
            openapi_version = "3.0"
        else:
            openapi_version = "2.0"

        document_text = f"OpenAPI Spec Version: {openapi_version}\n\n"
        document_text += f"Target Endpoint: {target_path}\n\n"

        if "paths" in openapi_spec and target_path in openapi_spec["paths"]:
            path_item = openapi_spec["paths"][target_path]
            document_text += f"Path: {target_path}\n"

            # Extract operations for this path
            for method in ["get", "put", "post", "delete", "options", "head", "patch", "trace"]:
                if method in path_item:
                    operation = path_item[method]
                    operation_id = operation.get("operationId", f"{method}_{target_path}")
                    summary = operation.get("summary", "")
                    description = operation.get("description", "")

                    document_text += f"  Operation: {method.upper()} {target_path}\n"
                    document_text += f"  OperationId: {operation_id}\n"
                    if summary:
                        document_text += f"  Summary: {summary}\n"
                    if description:
                        document_text += f"  Description: {description}\n"

                    # Parameters
                    parameters = []
                    if "parameters" in operation:
                        parameters.extend(operation["parameters"])
                    if "parameters" in path_item:
                        parameters.extend(path_item["parameters"])

                    if parameters:
                        document_text += "  Parameters:\n"
                        for param in parameters:
                            if "$ref" in param:
                                param_ref = param["$ref"]
                                document_text += f"    Parameter Reference: {param_ref}\n"
                            else:
                                param_name = param.get("name", "")
                                param_in = param.get("in", "")
                                param_required = "required" if param.get("required", False) else "optional"
                                document_text += f"    Parameter: {param_name} in {param_in} ({param_required})\n"

                    # Request body
                    if "requestBody" in operation:
                        document_text += "  Request Body:\n"
                        req_body = operation["requestBody"]
                        required = "required" if req_body.get("required", False) else "optional"
                        document_text += f"    Required: {required}\n"

                        if "content" in req_body:
                            for content_type, content_schema in req_body["content"].items():
                                document_text += f"    Content Type: {content_type}\n"
                                if "schema" in content_schema:
                                    schema = content_schema["schema"]
                                    if "$ref" in schema:
                                        document_text += f"    Schema Reference: {schema['$ref']}\n"
                                    else:
                                        document_text += f"    Schema Type: {schema.get('type', 'unknown')}\n"

                    # Responses
                    if "responses" in operation:
                        document_text += "  Responses:\n"
                        for status_code, response in operation["responses"].items():
                            document_text += f"    Status Code: {status_code}\n"
                            description = response.get("description", "")
                            if description:
                                document_text += f"    Description: {description}\n"

                            if "content" in response:
                                for content_type, content_schema in response["content"].items():
                                    document_text += f"    Content Type: {content_type}\n"
                                    if "schema" in content_schema:
                                        schema = content_schema["schema"]
                                        if "$ref" in schema:
                                            document_text += f"    Schema Reference: {schema['$ref']}\n"
                                        else:
                                            document_text += f"    Schema Type: {schema.get('type', 'unknown')}\n"

                    document_text += "\n"
        else:
            document_text += f"Error: Path {target_path} not found in the OpenAPI specification.\n"

        return [Document(text=document_text)]

    def process_api_spec(
            self, spec: dict, operation_id_filter: Callable[[str], bool]
    ) -> dict:
        """
        Perform simplification and reduction on an OpenAPI specification.

        The goal is to create a more concise and efficient representation
        for retrieval purposes.
        """

        def reduce_details(details: dict) -> dict:
            reduced = OrderedDict()
            if details.get("description"):
                reduced["description"] = details.get("description")
            elif details.get("summary"):
                reduced["description"] = details.get("summary")
            if details.get("parameters"):
                reduced["parameters"] = details.get("parameters", [])
            if details.get("requestBody"):
                reduced["requestBody"] = details.get("requestBody")
            if "200" in details["responses"]:
                reduced["responses"] = details["responses"]["200"]
            return reduced

        def dereference_openapi(openapi_doc):
            """Dereferences a Swagger/OpenAPI document by resolving all $ref pointers."""
            try:
                import jsonschema
            except ImportError:
                raise ImportError(
                    "The jsonschema library is required to parse OpenAPI documents. "
                    "Please install it with `pip install jsonschema`."
                )

            resolver = jsonschema.RefResolver.from_schema(openapi_doc)

            def _dereference(obj):
                if isinstance(obj, dict):
                    if "$ref" in obj:
                        with resolver.resolving(obj["$ref"]) as resolved:
                            return _dereference(resolved)
                    return {k: _dereference(v) for k, v in obj.items()}
                elif isinstance(obj, list):
                    return [_dereference(item) for item in obj]
                else:
                    return obj

            return _dereference(openapi_doc)

        spec = dereference_openapi(spec)
        endpoints = []
        for path_template, operations in spec["paths"].items():
            for operation, operation_detail in operations.items():
                operation_id = operation_detail.get("operationId")
                if operation_id_filter is None or operation_id_filter(operation_id):
                    if operation in ["get", "post", "patch", "put", "delete"]:
                        # preserve order so the LLM "reads" the description first before all the
                        # schema details
                        details = OrderedDict()
                        details["verb"] = operation.upper()
                        details["path_template"] = path_template
                        details.update(reduce_details(operation_detail))
                        endpoints.append(details)

        return {
            "servers": spec["servers"],
            "description": spec["info"].get("description"),
            "endpoints": endpoints,
        }
```