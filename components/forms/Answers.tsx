"use client";

import React, { useRef, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { AnswerSchema } from "@/lib/validations";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Editor } from "@tinymce/tinymce-react";
import { useTheme } from "@/context/ThemeProvider";
import { Button } from "../ui/button";
import Image from "next/image";
import { createAnswer } from "@/lib/actions/answer.actions";
import { usePathname } from "next/navigation";
import { ReloadIcon } from "@radix-ui/react-icons";
//import axios from 'axios'

// Type definition for the component props.
interface Props {
  question: string;
  questionId: string;
  authorId: string;
}

const Answers = ({ question, questionId, authorId }: Props) => {
  const { mode } = useTheme();
  const editorRef = useRef(null);
  const pathname = usePathname();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingAI, setIsSubmittingAI] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Set up the form with React Hook Form and Zod validation.
  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      answer: "",
    },
  });

  // Function to handle form submission and create an answer.
  const handleCreateAnswer = async (values: z.infer<typeof AnswerSchema>) => {
    setIsSubmitting(true);
  
    try {
      await createAnswer({
        content: values.answer,
        author: JSON.parse(authorId),
        question: JSON.parse(questionId),
        path: pathname,
      });
      form.reset();

      // Clear the TinyMCE editor content.
      if (editorRef.current) {
        const editor = editorRef.current as any;
        editor.setContent("");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
   
    }
  };

  const generateAIAnswer = async () => {
    if (!authorId) return;
    setIsSubmittingAI(true);
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/chatgpt`,
        {
          method: "POST",
          body: JSON.stringify({ question }),
        }
      );
      const aiAnswer = await response.json();
  // convert the plain text to HTML format
const formattedAnswer = aiAnswer.reply.replace(/\n/g, '<br />')

if (editorRef. current) {
  const editor = editorRef.current as any;
  editor.setContent(formattedAnswer)
}

    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmittingAI(false);
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header and AI answer generation button. */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2 pt-3">
        <h4 className="paragraph-semibold text-dark400_light800">
          Write your answer Here
        </h4>
        <Button
          className="btn light-border-2 gap-1.5 rounded-md px-4 py-2.5 text-primary-500 shadow-none"
          onClick={generateAIAnswer}
        >
          {isSubmittingAI ? (
            <>
            <Image
            src="/assets/icons/stars.png"
            alt="star"
            width={40}
            height={40}
           className="object-contain"
          />
           <ReloadIcon className=" my-2 h-10 w-10 text-primary-500 animate-spin" />
            Generating....
            </>
          ):(
            <>
             <Image
            src="/assets/icons/stars.png"
            alt="star"
            width={40}
            height={40}
           className="object-contain"
          />
          Generate AI Answer
            </>
          )}
      
        </Button>
      </div>
      {/* main form and editor */}
      <Form {...form}>
        <form
          className="mt-6 flex w-full flex-col gap-10"
          onSubmit={form.handleSubmit(handleCreateAnswer)}
        >
          <FormField
            control={form.control}
            name="answer"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-3">
                <FormControl className="mt-3.5 ">
                  {/**Editor from tiny Docs */}
                  <Editor
                    apiKey={process.env.NEXT_PUBLIC_TINY_EDITOR_API_KEY}
                    onInit={(evt, editor) => {
                      //@ts-ignore
                      editorRef.current = editor;
                    }}
                    onBlur={field.onBlur}
                    onEditorChange={(content) => field.onChange(content)}
                    init={{
                      height: 350,
                      menubar: false,
                      plugins: [
                        "advlist",
                        "autolink",
                        "lists",
                        "link",
                        "image",
                        "charmap",
                        "print",
                        "preview",
                        "anchor",
                        "searchreplace",
                        "visualblocks",
                        "code",
                        "fullscreen",
                        "insertdatetime",
                        "codesample",
                        "media",
                        "table",
                      ],

                      toolbar:
                        "undo redo | " +
                        "codesample | bold italic backcolor | alignleft aligncenter |" +
                        "alignright alignjustify | bullist numlist",
                      content_style:
                        "body { font-family:Inter font-size:16px }",
                      skin: mode === "dark" ? "oxide-dark" : "oxide",
                      content_css: mode === "dark" ? "dark" : "light",
                    }}
                  />
                </FormControl>
                <FormMessage className="text-orange-900" />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              className="primary-gradient w-fit !text-light-900"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Answers;
