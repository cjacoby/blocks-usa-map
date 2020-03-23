import React, { useState } from 'react';
import {
    initializeBlock,
    useBase,
    useRecords,
    useGlobalConfig,
    useSettingsButton,
    useViewport,
    TablePickerSynced,
    FieldPickerSynced,
    FormField,
    Box,
    Switch,
    colorUtils,
} from '@airtable/blocks/ui';
import {FieldType} from '@airtable/blocks/models';

import USAMap from "react-usa-map";
import SelectedState from "./selectedState";

import codeStateMap from "./stateCodes"
const stateCodeMap = Object.fromEntries(Object.entries(codeStateMap).map(a => a.reverse()));


function USAMapBlock() {
    const [isShowingSettings, setIsShowingSettings] = useState(false);
    const [selectedState, setSelectedState] = useState(null);

    useSettingsButton(function() {
        setIsShowingSettings(!isShowingSettings);
    });

    const viewport = useViewport();

    const base = useBase();
    const globalConfig = useGlobalConfig();
    const tableId = globalConfig.get('selectedTableId');
    const stateFieldId = globalConfig.get('selectedStateFieldId');
    const colorFieldId = globalConfig.get('selectedColorFieldId');

    const table = base.getTableByIdIfExists(tableId);
    const stateField = table ? table.getFieldByIdIfExists(stateFieldId) : null;
    const colorField = table ? table.getFieldByIdIfExists(colorFieldId) : null;

    // if (table == null || stateField == null || colorField == null) {
    //     setIsShowingSettings(true);
    // }

    const records = useRecords(stateField ? table : null);

    let mapData = null;
    if (stateField !== null && colorField !== null) {
        mapData = getMapData(records, stateField.name, colorField);
    }

    const mapHandler = (event) => {
        setSelectedState(event.target.dataset.name);
    };

    // If settings is showing, draw settings only
    if (isShowingSettings) {
        return (
            <Box padding={3} display="flex">
                <FormField
                    label="Table"
                    description="Choose the table you want to your State data to come from."
                    padding={1}
                    marginBottom={0}
                >
                    <TablePickerSynced globalConfigKey="selectedTableId" />
                </FormField>
                <FormField
                    label="State Field"
                    description='The State field will select a state by either abbreviation ("NJ") or name ("New Jersey")'
                    marginBottom={0}
                    padding={1}
                >
                    <FieldPickerSynced
                        table={table}
                        globalConfigKey="selectedStateFieldId"
                        placeholder="Pick a 'state' field..."
                        allowedTypes={[FieldType.SINGLE_LINE_TEXT, FieldType.SINGLE_SELECT]}
                    />
                </FormField>
                <FormField
                    label="Color Field"
                    marginBottom={0}
                    description="Choose the state color using either a text field which describes the color name, or a single select."
                    padding={1}
                >
                    <FieldPickerSynced
                        table={table}
                        globalConfigKey="selectedColorFieldId"
                        placeholder="Pick a 'color' field..."
                        allowedTypes={[FieldType.SINGLE_LINE_TEXT, FieldType.SINGLE_SELECT]}
                    />
                </FormField>
            </Box>
        )
    }
    // otherwise draw the map.
    return (
        <div>
            <Box border="default"
                 backgroundColor="lightGray1"
                //  padding={}
                 >
                {/* TODO Allow selected state to show a column of data. */}
                {/* {selectedState
                    ? <SelectedState selected={selectedState}/>
                    : <div>Click to select a state</div>
                } */}
                <USAMap
                    title="USA USA USA"
                    width={viewport.size.width}
                    height={viewport.size.height - 5}
                    customize={mapData}
                    onClick={mapHandler}
                />
            </Box>
        </div>
    )
}

initializeBlock(() => <USAMapBlock />);


function getMapData(records, stateFieldName, colorField) {
    const stateColorMap = new Map();
    for (const record of records) {
        const stateText = record.getCellValue(stateFieldName);
        const colorValue = record.getCellValue(colorField.name);

        // Validate the state field
        // This uses a map of stateCode:stateName, and an inverse map of stateName:stateCode to allow the user to
        // enter either the code or the name.
        let stateCode;
        // If it was in a state abbreviation format
        if (stateText in codeStateMap) {
            stateCode = stateText;
        } 
        // state name format
        else if (stateText in stateCodeMap) {
            stateCode = stateCodeMap[stateText];
        }
        // anything else
        else {
            stateCode = null;
        }

        if (stateCode !== null && colorValue !== null) {
            const color = colorField.type == FieldType.SINGLE_SELECT ? colorUtils.getHexForColor(colorValue.color) : colorValue;

            if (stateCode !== null && color !== null) {
                stateColorMap[stateCode] = {fill: color};
            }
        }
    }

    return stateColorMap;
}
