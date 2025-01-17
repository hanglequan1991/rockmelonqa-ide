import { IActionTemplateParam } from "../../types";
import { escapeStr, getParameters } from "../../utils/stringUtils";

export default (params: IActionTemplateParam) => {
  return `await expect(defs.Page).toHaveTitle("${escapeStr(params.data)}");`;
};
