//
//  UIJastChatIO.h
//  JastChatSample
//
//  Created by adelskott on 06/04/13.
//  Copyright (c) 2013 adelskott. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "SocketIO.h"

@interface UIJastChatIO : NSObject<SocketIODelegate>{
    SocketIO *socketIO;
    BOOL run;
    NSMutableDictionary *callbacks;
}

@property (nonatomic,strong) NSString *key;
@property (nonatomic,strong) NSString *appid;
@property (nonatomic,strong) NSString *clientid;

+(UIJastChatIO*)getInstance;
-(void)socketconnect;

-(void)sendmessage:(NSString*)channel message:(id)message;
-(void)connectChannel:(NSString*)channel getold:(BOOL)getold;
-(void)listen:(NSString*)channel cb:(void(^)(NSDictionary* rep))cb;

@end
