import React, { useState, useEffect, useRef } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
  ContentBlock,
  convertToRaw,
  convertFromRaw,
  genKey,
} from "draft-js";
import { style } from "../utils/style";
import "draft-js/dist/Draft.css";

const Draft = ({ setDraftArea }) => {
  // to handle initial state of Editor
  const handleState = () => {
    const savedState = localStorage.getItem("draft");
    if (savedState != null && savedState != undefined) {
      return EditorState.createWithContent(
        convertFromRaw(JSON.parse(savedState))
      );
    } else {
      return EditorState.createEmpty();
    }
  };

  const ref = useRef(null);
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  // for focus
  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  useEffect(() => {
    const savedContent = localStorage.getItem("draft");
    if (savedContent !== null && savedContent !== undefined) {
      try {
        const contentRaw = JSON.parse(savedContent);
        const contentState = convertFromRaw(contentRaw);
        setEditorState(EditorState.createWithContent(contentState));
      } catch (error) {
        console.error("Error parsing saved content:", error);
        // Handle the error appropriately, e.g., clear localStorage or show a message to the user.
      }
    }
  }, []);

  const handleBeforeInput = function (input) {
    if (!editorState) {
      return; // Exit early if editorState is not defined
    }

    if (input === " ") {
      // console.log("inside");
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
        // console.log("got #");
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

        setEditorState(
          // setEditorState(RichUtils.toggleBlockType(newEditorState, "header-one"));
          RichUtils.toggleInlineStyle(newEditorState, "HEADER_ONE")
        );
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
      setEditorState(newState);
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

  // onChangeHandler
  const handleChange = (newEditorState) => {
    setEditorState(newEditorState);
    const contentState = editorState.getCurrentContent();
    const contentRaw = convertToRaw(contentState);
    setDraftArea(contentRaw);
    // console.log(
    //   "data2",
    //   htmlData,
    //   convertToRaw(newEditorState.getCurrentContent())
    // );
  };

  return (
    <div className="p-[14px] h-[80vh] mt-1 border-4 border-blue-800">
      <Editor
        ref={ref}
        editorState={editorState}
        onChange={handleChange}
        handleBeforeInput={handleBeforeInput}
        handleKeyCommand={handleKeyCommand}
        customStyleMap={style}
      />
    </div>
  );
};

export default Draft;
