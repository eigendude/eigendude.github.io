/*
 * Copyright (C) 2020 Garrett Brown
 * This file is part of trajectory-reconstruction - https://github.com/eigendude/trajectory-reconstruction
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

#include "motion_tracker.hpp"

#include <emscripten/bind.h>

using namespace emscripten;

EMSCRIPTEN_BINDINGS(motion_tracker)
{
  value_object<FrameInfo>("FrameInfo")
    .field("sceneScore", &FrameInfo::sceneScore)
    .field("pointData", &FrameInfo::pointData)
    .field("pointSize", &FrameInfo::pointSize)
    .field("initialPointData", &FrameInfo::initialPointData)
    .field("initialPointSize", &FrameInfo::initialPointSize)
    .field("projectionMatrixData", &FrameInfo::projectionMatrixData)
    .field("projectionMatrixSize", &FrameInfo::projectionMatrixSize)
    ;

  value_object<ConfigOptions>("ConfigOptions")
    .field("maxPointCount", &ConfigOptions::maxPointCount)
    .field("maxFrameCount", &ConfigOptions::maxFrameCount)
    ;

  class_<MotionTracker>("MotionTracker")
    .constructor<>()
    .function("initialize", &MotionTracker::Initialize)
    .function("setConfig", &MotionTracker::SetConfig)
    .function("addVideoFrame", &MotionTracker::AddVideoFrame)
    .function("deinitialize", &MotionTracker::Deinitialize)
    ;
}
