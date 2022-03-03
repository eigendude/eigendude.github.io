/*
 * Copyright (C) 2020 Garrett Brown
 * This file is part of trajectory-reconstruction - https://github.com/eigendude/trajectory-reconstruction
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

#include "frame_pool.hpp"

#include <algorithm>

void FrameData::Reset()
{
  mafd = 0.0;
  sceneScore = 0.0;
  points.clear();
  status.clear();
  errors.clear();
  projectionMatrix.create(3, 4, CV_32F);
  projectionMatrix = cv::Scalar::all(0);
}

FramePtr FramePool::GetFrame()
{
  // Consider a frame unused if its reference count drops to 1
  auto isUnused = [](const FramePtr& frameData)
    {
      return frameData.use_count() == 1;
    };

  // Search for unused frame
  auto it = std::find_if(m_frames.begin(), m_frames.end(), isUnused);

  // If found, reset and return it
  if (it != m_frames.end())
  {
    (*it)->Reset();
    return *it;
  }

  // Unused frame not found, create a new one
  FramePtr newFrame = std::make_shared<FrameData>();

  // Add frame to frame pool
  m_frames.push_back(newFrame);

  return newFrame;
}
