/*
 * Copyright (C) 2020 Garrett Brown
 * This file is part of trajectory-reconstruction - https://github.com/eigendude/trajectory-reconstruction
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

#pragma once

#include <memory>
#include <opencv2/core/mat.hpp>
#include <opencv2/core/types.hpp>
#include <stdint.h>
#include <vector>

struct FrameData;

// Alias used for frames on the heap
using FramePtr = std::shared_ptr<FrameData>;

struct FrameData
{
  // Mean absolute frame difference (see image_utils.hpp)
  double mafd = 0.0;

  // Scene score (see image_utils.hpp)
  double sceneScore = 0.0;

  // Points corresponding to features being tracked
  std::vector<cv::Point2f> points;

  // Status; each element of the vector is set to 1 if the flow for the
  // corresponding features has been found, otherwise, it is set to 0.
  std::vector<uint8_t> status;

  // Errors; each element of the vector is set to an error for the
  // corresponding feature, type of the error measure can be set in flags
  // parameter; if the flow wasn't found then the error is not defined
  // (use the status parameter to find such cases).
  std::vector<float> errors;

  // 3x4 projection matrix
  cv::Mat projectionMatrix;

  void Reset();
};

/*
 * \brief Nice, simple frame pool
 *
 * Frames are reference-tracked using std::shared_ptr. When a new frame is
 * requested, we search the pool for a frame with a reference count of one.
 * When the frame becomes unused, simply reset the pointer, and it will become
 * available in the pool again.
 */
class FramePool
{
public:
  FramePtr GetFrame();

private:
  std::vector<FramePtr> m_frames;
};
