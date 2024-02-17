import React, { useState, useEffect, useRef } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  ContentBlock,
  convertToRaw,
  convertFromRaw,
  Modifier,
  genKey,
} from "draft-js";
import { style } from "../utils/style";
import draftToHtml from "draftjs-to-html";
import "draft-js/dist/Draft.css";

const Draft = ({ setDraftArea }) => {
  const handleState = () => {
    const savedState = localStorage.getItem("draft");
    if (savedState) {
      return EditorState.createWithContent(
        convertFromRaw(JSON.parse(savedState))
      );
    } else {
      return EditorState.createEmpty();
    }
  };

  const ref = useRef(null);
  const [editorState, setEditorState] = useState(handleState());
  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  const handleChange = (newEditorState) => {
    const contentState = newEditorState.getCurrentContent();
    const selectionState = newEditorState.getSelection();
    const currentBlock = contentState.getBlockForKey(
      selectionState.getStartKey()
    );
    let htmlData = draftToHtml(convertToRaw(contentState));

    setEditorState(newEditorState);
    setDraftArea(convertToRaw(contentState));
    console.log(
      "data2",
      htmlData,
      convertToRaw(newEditorState.getCurrentContent())
    );
  };

  const handleBeforeInput = function (input) {
    if (input === " ") {
      console.log("inside");
      const selectionState = editorState.getSelection();
      const contentState = editorState.getCurrentContent();
      const currentBlock = contentState.getBlockForKey(
        selectionState.getStartKey()
      );

      // Check if currentBlock is defined before using it
      if (!currentBlock) {
        return "handled";
      }

      const currentBlockText = currentBlock.getText();
      const start = selectionState.getStartOffset() - 1;
      const startd = selectionState.getStartOffset() - 2;
      const startt = selectionState.getStartOffset() - 3;
      const end = selectionState.getEndOffset();

      if (currentBlockText.charAt(start) === "#" && start === 0) {
        console.log("got #");
        const newContentState = Modifier.replaceText(
          contentState,
          selectionState.merge({
            anchorOffset: start,
            focusOffset: end,
          }),
          currentBlockText.slice(2)
        );

        const newEditorState = EditorState.push(
          editorState,
          newContentState,
          "remove-range"
        );

        setEditorState(RichUtils.toggleBlockType(newEditorState, "header-one"));
        return "handled";
      }
      if (currentBlockText.charAt(start) === "*" && start === 0) {
        const newContentState = Modifier.replaceText(
          contentState,
          selectionState.merge({
            anchorOffset: start,
            focusOffset: end,
          }),
          currentBlockText.slice(2)
        );

        const newEditorState = EditorState.push(
          editorState,
          newContentState,
          "remove-range"
        );

        setEditorState(RichUtils.toggleInlineStyle(newEditorState, "BOLD"));
        return "handled";
      }
      if (
        currentBlockText.charAt(start) === "*" &&
        currentBlockText.charAt(startd) === "*" &&
        start === 1
      ) {
        const newContentState = Modifier.replaceText(
          contentState,
          selectionState.merge({
            anchorOffset: startd,
            focusOffset: end,
          }),
          currentBlockText.slice(2)
        );

        const newEditorState = EditorState.push(
          editorState,
          newContentState,
          "remove-range"
        );

        setEditorState(
          RichUtils.toggleInlineStyle(newEditorState, "COLOR_RED")
        );
        return "handled";
      }
      if (currentBlockText.slice(start, end) === "***") {
        const newContentState = Modifier.replaceText(
          contentState,
          selectionState.merge({
            anchorOffset: start,
            focusOffset: end,
          }),
          ""
        );

        const newEditorState = EditorState.push(
          editorState,
          newContentState,
          "remove-range"
        );

        const contentStateWithUnderline = Modifier.applyInlineStyle(
          newEditorState.getCurrentContent(),
          newEditorState.getSelection(),
          "UNDERLINE"
        );

        const editorStateWithUnderline = EditorState.set(editorState, {
          currentContent: contentStateWithUnderline,
        });

        setEditorState(editorStateWithUnderline);
        return "handled";
      }
      if (currentBlockText.slice(startt, end) === "***") {
        const newContentState = Modifier.replaceText(
          contentState,
          selectionState.merge({
            anchorOffset: startt,
            focusOffset: end,
          }),
          currentBlockText.slice(3)
        );

        const newEditorState = EditorState.push(
          editorState,
          newContentState,
          "remove-range"
        );

        setEditorState(
          RichUtils.toggleInlineStyle(newEditorState, "UNDERLINE")
        );
        return "handled";
      }
    }
  };

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      handleChange(newState);
      return "handled";
    }

    if (command === "split-block") {
      const currentContent = editorState.getCurrentContent();
      const currentSelection = editorState.getSelection();

      // Create a new empty block with the same text as the current selection
      const newBlock = new ContentBlock({
        key: genKey(),
        type: "unstyled",
        text: "\n",
        characterList: "",
      });

      // Add the new block after the current selection
      const blockMap = currentContent
        .getBlockMap()
        .set(newBlock.getKey(), newBlock);
      const newContentState = currentContent.merge({
        blockMap,
        selectionAfter: currentSelection.merge({
          anchorKey: newBlock.getKey(),
          focusKey: newBlock.getKey(),
          anchorOffset: 0,
          focusOffset: 0,
        }),
      });

      // Update the editorState with the new content and selection
      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "split-block"
      );
      setEditorState(newEditorState);
      return "handled";
    }
    return "not-handled";
  };

  return (
    <div className="p-[14px] h-[80vh] mt-1 border-4 border-blue-800">
      <Editor
        ref={ref}
        editorState={editorState}
        onChange={handleChange}
        handleKeyCommand={handleKeyCommand}
        handleBeforeInput={handleBeforeInput}
        customStyleMap={style}
        // blockStyleFn={blockStyleFn}
      />
    </div>
  );
};

export default Draft;
