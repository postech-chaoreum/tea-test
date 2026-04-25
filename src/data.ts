import appConfigData from "../data/app-config.json";
import questionsData from "../data/questions.json";
import teaResultsData from "../data/tea-results.json";
import type { AppConfig, Question, TeaResult } from "./types";

export const appConfig = appConfigData as unknown as AppConfig;
export const questions = questionsData as unknown as Question[];
export const teaResults = teaResultsData as unknown as TeaResult[];
