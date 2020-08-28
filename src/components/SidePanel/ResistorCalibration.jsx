/* Copyright (c) 2015 - 2018, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React from 'react';
import { string } from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import { NumberInlineInput, Slider } from 'pc-nrfconnect-shared';

import Collapse from './Collapse';

import {
    updateResistors,
    resetResistors,
} from '../../actions/deviceActions';

import { appState } from '../../reducers/appReducer';
import {
    updateHighResistorAction,
    updateMidResistorAction,
    updateLowResistorAction,
    resistorCalibrationState,
} from '../../reducers/resistorCalibrationReducer';

const ResistorCalibration = ({ eventKey }) => {
    const dispatch = useDispatch();
    const { userResLo, userResMid, userResHi } = useSelector(resistorCalibrationState);
    const { capabilities } = useSelector(appState);

    if (!capabilities.ppkUpdateResistors) {
        return null;
    }

    return (
        <Collapse title="RESISTOR CALIBRATION" eventKey={eventKey}>
            <Form.Label htmlFor="slider-res-hi">
                High{' '}
                <NumberInlineInput
                    value={userResHi}
                    range={{ min: 1, max: 3 }}
                    onChange={value => dispatch(updateHighResistorAction(value))}
                    chars={5}
                />
                { '\u2126'}
            </Form.Label>
            <Slider
                id="slider-res-hi"
                values={[userResHi]}
                range={{ min: 1, max: 3, decimals: 2 }}
                onChange={[value => dispatch(updateHighResistorAction(value))]}
                onChangeComplete={() => dispatch(updateResistors())}
            />
            <Form.Label htmlFor="slider-res-mid">
                Mid{' '}
                <NumberInlineInput
                    value={userResMid}
                    range={{ min: 25, max: 35 }}
                    onChange={value => dispatch(updateMidResistorAction(value))}
                    chars={5}
                />
                { '\u2126'}
            </Form.Label>
            <Slider
                id="slider-res-mid"
                values={[userResMid]}
                range={{ min: 25, max: 35, decimals: 1 }}
                onChange={[value => dispatch(updateMidResistorAction(value))]}
                onChangeComplete={() => dispatch(updateResistors())}
            />
            <Form.Label htmlFor="slider-res-low">
                Low{' '}
                <NumberInlineInput
                    value={userResLo}
                    range={{ min: 450, max: 550 }}
                    onChange={value => dispatch(updateLowResistorAction(value))}
                    chars={4}
                />
                { '\u2126'}
            </Form.Label>
            <Slider
                id="slider-res-low"
                values={[userResLo]}
                range={{ min: 450, max: 550 }}
                onChange={[value => dispatch(updateLowResistorAction(value))]}
                onChangeComplete={() => dispatch(updateResistors())}
            />
            <ButtonGroup className="mt-2">
                <Button
                    onClick={() => dispatch(updateResistors())}
                    variant="light"
                >
                    Update
                </Button>
                <Button
                    onClick={() => dispatch(resetResistors())}
                    variant="light"
                >
                    Reset
                </Button>
            </ButtonGroup>
        </Collapse>
    );
};

ResistorCalibration.propTypes = {
    eventKey: string.isRequired,
};

export default ResistorCalibration;
