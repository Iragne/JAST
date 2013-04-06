//
//  UIJastAppDelegate.h
//  JastChatSample
//
//  Created by adelskott on 01/04/13.
//  Copyright (c) 2013 adelskott. All rights reserved.
//

#import <UIKit/UIKit.h>

@class UIJastViewController;

@interface UIJastAppDelegate : UIResponder <UIApplicationDelegate>

@property (strong, nonatomic) UIWindow *window;

@property (strong, nonatomic) UIJastViewController *viewController;
@property (strong, nonatomic) UINavigationController *nav;

@end
