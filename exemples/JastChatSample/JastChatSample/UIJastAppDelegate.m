//
//  UIJastAppDelegate.m
//  JastChatSample
//
//  Created by adelskott on 01/04/13.
//  Copyright (c) 2013 adelskott. All rights reserved.
//

#import "UIJastAppDelegate.h"
#import "UIJastViewController.h"
#import "UIJastChatIO.h"

@implementation UIJastAppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
    // Override point for customization after application launch.

    self.viewController = [[UIJastViewController alloc] initWithNibName:@"UIJastViewController" bundle:nil];
    self.nav = [[UINavigationController alloc ]initWithRootViewController:self.viewController];
    [self.nav.navigationBar setTintColor:[UIColor redColor]];
    [[UIApplication sharedApplication] setStatusBarStyle:(UIStatusBarStyleBlackOpaque)];
    self.window.rootViewController = self.nav;
    [self.window makeKeyAndVisible];
    UIJastChatIO *jast = [UIJastChatIO getInstance];
    jast.appid = @"3";
    jast.clientid = @"1";
    jast.key = @"3e50a5a9efb652e9023af556eaa1ac074c0295c5";
//    jast.key = @"1b32394436183cdba676dc36269d81a10bc135cd";
    [jast socketconnect];
    
    return YES;
}

- (void)applicationWillResignActive:(UIApplication *)application
{
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
}

- (void)applicationDidEnterBackground:(UIApplication *)application
{
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later. 
    // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
}

- (void)applicationWillEnterForeground:(UIApplication *)application
{
    // Called as part of the transition from the background to the inactive state; here you can undo many of the changes made on entering the background.
}

- (void)applicationDidBecomeActive:(UIApplication *)application
{
    // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
}

- (void)applicationWillTerminate:(UIApplication *)application
{
    // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
}

@end
