/*
 * Copyright (C) 2020 Garrett Brown
 * This file is part of trajectory-reconstruction - https://github.com/eigendude/trajectory-reconstruction
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

#include "cpu_reconstruction.hpp"

#include "api/reconstruction.hpp"

#include <opencv2/gapi/cpu/gcpukernel.hpp>
#include <opencv2/sfm/reconstruct.hpp>

namespace reconstruction
{
  // Reconstruct trajectory
  GAPI_OCV_KERNEL(GCPUReconstructTrajectory, GReconstructTrajectory)
  {
    static void run(const std::vector<std::vector<cv::Point2f>>& pointHistory,
                    const cv::Mat& initialCameraMatrix,
                    cv::Mat& projectionMatrix,
                    cv::Mat& updatedCameraMatrix)
    {
      // If true, the cameras is supposed to be projective
      const bool isProjective = true;

      // Initialize the updated camera matrix
      updatedCameraMatrix = initialCameraMatrix;

      // Reconstruct the scene using the 2d correspondences
      std::vector<cv::Mat> projections;

      // Unused (we would have to project these back to 2D image space for them
      // to be useful)
      std::vector<cv::Point3f> estimated3dPoints;

      // Perform reconstruction
      cv::sfm::reconstruct(pointHistory, projections, estimated3dPoints, updatedCameraMatrix, isProjective);

      // We are interested in the most recent projection
      projectionMatrix = projections.back();
    }
  };
}

cv::gapi::GKernelPackage reconstruction::kernels()
{
  static auto pkg = cv::gapi::kernels
    < GCPUReconstructTrajectory
    >();

  return pkg;
}
