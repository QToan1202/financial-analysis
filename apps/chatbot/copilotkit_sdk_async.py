from copilotkit import CopilotKitSDK
from copilotkit.sdk import CopilotKitSDKContext
from copilotkit.types import Message
from copilotkit.action import ActionDict
from copilotkit.exc import (
    AgentNotFoundException,
    AgentExecutionException
)
from typing import List,  Any


class CopilotKitSDKAsync(CopilotKitSDK):
    async def execute_agent(  # pylint: disable=too-many-arguments
        self,
        *,
        context: CopilotKitSDKContext,
        name: str,
        thread_id: str,
        node_name: str,
        state: dict,
        messages: List[Message],
        actions: List[ActionDict],
    ) -> Any:
        """Execute an agent"""
        agents = self.agents(context) if callable(self.agents) else self.agents
        agent = next((agent for agent in agents if agent.name == name), None)
        if agent is None:
            raise AgentNotFoundException(name)

        try:
            return await agent.execute(
                context=context,
                thread_id=thread_id,
                node_name=node_name,
                state=state,
                messages=messages,
                actions=actions,
            )
        except Exception as error:
            raise AgentExecutionException(name, error) from error
