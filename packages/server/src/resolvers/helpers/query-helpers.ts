const getSelectedFields = (info: any): string[] => {
  return info.fieldNodes[0].selectionSet.selections.map((selection: any) => {
    return selection.name.value;
  });
};

export { getSelectedFields };
