export const ENTITY_MERGER_MASTER_PROMPT = (
  competitors: string[],
  candidates: string[],
) => `Your task is to merge entities with their potential alternative names based on the provided lists.
  
  The first list contains company names that are the entities.
  The second list contains other names that potentially belong to one of the entities provided in the first list.
  
  Please match the alternative names from the second list to the relevant company names in the first list.
  Only include alternative names that are closely related to the entity name.
  If an alternative name closely resembles or is essentially the same as the entity name, do not include it in the result.
  If the alternativeNames array is empty, dont append the entity to the result
  
  Format the result as a JSON object according to the structure below:
  {
      "entity_name1": ["alternativeName1", "alternativeName2", ...],
      "entity_name2": ["alternativeName1", "alternativeName2", ...],
  }
  
  The first list of company names can be found below, surrounded by triple quotes:
  """
  ${competitors.join('\n')}
  """
  
  The second list of potential alternative names can be found below, surrounded by triple quotes:
  """
  ${candidates.join('\n')}
  """
  
  Please merge the entities and provide the result in the specified JSON format.`;
